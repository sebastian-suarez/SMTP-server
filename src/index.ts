import net from "node:net";

enum States {
	CONNECTED,
	GREETED,
	RCPT_READY,
	DATA,
}

const server = net.createServer((socket) => {
	let state = States.CONNECTED;
	let hostname: string;
	let from: string;
	const to: string[] = [];
	let body: string[] = [];

	socket.write("220 Welcome to the SMTP server\r\n");

	socket.on("data", (data) => {
		const message = data.toString().trim();
		const [command, ...args] = message.split(" ");

		switch (state) {
			case States.CONNECTED: {
				if (!["HELO", "EHLO"].includes(command.toUpperCase())) {
					socket.write("503 Bad sequence of commands\r\n");
					return;
				}

				state = States.GREETED;
				hostname = args[0];
				socket.write(`250 Hello ${hostname}\r\n`);
				break;
			}

			case States.GREETED: {
				const [command_, email] = message.split(":");
				if (command_.toUpperCase() !== "MAIL FROM") {
					socket.write("503 Bad sequence of commands\r\n");
					return;
				}

				from = email;
				state = States.RCPT_READY;
				socket.write(`250 OK\r\n`);
				break;
			}

			case States.RCPT_READY: {
				const [command_, email] = message.split(":");
				if (command_ !== "RCPT TO" && command !== "DATA") {
					socket.write("503 Bad sequence of commands\r\n");
					return;
				}

				if (command === "DATA") {
					state = States.DATA;
					socket.write(`250 OK\r\n`);
					return;
				}

				to.push(email);
				socket.write(`250 OK\r\n`);
				break;
			}

			case States.DATA: {
				if (message === ".") {
					console.log(
						`${hostname} sends from ${from} to ${to.join(",")} ${body.join("\r\n ")}`,
					);
					state = States.GREETED;
					from = "";
					body = [];
					socket.write("250 OK");
					return;
				}

				body.push(...message.split("\r\n"));
				break;
			}
		}
	});

	socket.on("end", () => {
		console.log("Client disconnected");
	});
});

server.listen(2525);
