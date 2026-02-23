import { Buffer } from "node:buffer";

type Handler = (...arguments_: unknown[]) => void;
type UnstableMockModule = (
	moduleName: string,
	moduleFactory: () => unknown,
) => void;

const jestApi = import.meta.jest;
const unstableMockModule = Reflect.get(
	jestApi as Record<string, unknown>,
	"unstable_mockModule",
) as UnstableMockModule;

class MockSocket {
	write = jestApi.fn<void, [string]>();
	end = jestApi.fn<void, unknown[]>();

	private readonly handlers: Record<"data" | "end", Handler[]> = {
		data: [],
		end: [],
	};

	on(event: "data" | "end", handler: Handler): this {
		this.handlers[event].push(handler);
		return this;
	}

	send(message: string): void {
		this.emit("data", Buffer.from(message));
	}

	disconnect(): void {
		this.emit("end");
	}

	private emit(event: "data" | "end", ...arguments_: unknown[]): void {
		for (const handler of this.handlers[event]) {
			handler(...arguments_);
		}
	}
}

const loadServer = async () => {
	let connectionHandler: ((socket: MockSocket) => void) | undefined;
	const listen = jestApi.fn();
	const createServer = jestApi.fn((handler: (socket: MockSocket) => void) => {
		connectionHandler = handler;
		return { listen };
	});

	unstableMockModule("node:net", () => ({
		default: { createServer },
		createServer,
	}));

	await import("#src/index.js");

	if (!connectionHandler) {
		throw new Error("Server connection handler was not registered");
	}

	return { connectionHandler, listen };
};

describe("SMTP server", () => {
	beforeEach(() => {
		jestApi.resetModules();
		jestApi.clearAllMocks();
	});

	it("starts listening on port 2525", async () => {
		const { listen } = await loadServer();

		expect(listen).toHaveBeenCalledTimes(1);
		expect(listen).toHaveBeenCalledWith(2525);
	});

	it("writes a greeting when a client connects", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();

		connectionHandler(socket);

		expect(socket.write).toHaveBeenCalledWith(
			"220 Welcome to the SMTP server\r\n",
		);
	});

	it("rejects commands before HELO/EHLO", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();

		connectionHandler(socket);
		socket.send("MAIL FROM:<from@example.com>");

		expect(socket.write).toHaveBeenLastCalledWith(
			"503 Bad sequence of commands\r\n",
		);
	});

	it("handles QUIT before DATA mode", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();

		connectionHandler(socket);
		socket.send("QUIT");

		expect(socket.write).toHaveBeenLastCalledWith("221 Bye\r\n");
		expect(socket.end).toHaveBeenCalledTimes(1);
	});

	it("accepts the happy path command flow and logs message data", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();
		const log = jestApi
			.spyOn(console, "log")
			.mockImplementation(() => undefined);

		connectionHandler(socket);
		socket.send("HELO localhost");
		socket.send("MAIL FROM:<from@example.com>");
		socket.send("RCPT TO:<to@example.com>");
		socket.send("DATA");
		socket.send("Hello\r\nWorld");
		socket.send(".");

		expect(socket.write).toHaveBeenNthCalledWith(2, "250 Hello localhost\r\n");
		expect(socket.write).toHaveBeenNthCalledWith(3, "250 OK\r\n");
		expect(socket.write).toHaveBeenNthCalledWith(4, "250 OK\r\n");
		expect(socket.write).toHaveBeenNthCalledWith(5, "250 OK\r\n");
		expect(socket.write).toHaveBeenLastCalledWith("250 OK");
		expect(log).toHaveBeenCalledWith(
			"localhost sends from <from@example.com> to <to@example.com> Hello\r\n World",
		);
	});

	it("resets to GREETED after completing DATA", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();

		connectionHandler(socket);
		socket.send("HELO localhost");
		socket.send("MAIL FROM:<first@example.com>");
		socket.send("RCPT TO:<to@example.com>");
		socket.send("DATA");
		socket.send("Body");
		socket.send(".");
		socket.send("MAIL FROM:<second@example.com>");

		expect(socket.write).toHaveBeenLastCalledWith("250 OK\r\n");
	});

	it("logs disconnects on socket end", async () => {
		const { connectionHandler } = await loadServer();
		const socket = new MockSocket();
		const log = jestApi
			.spyOn(console, "log")
			.mockImplementation(() => undefined);

		connectionHandler(socket);
		socket.disconnect();

		expect(log).toHaveBeenCalledWith("Client disconnected");
	});
});
