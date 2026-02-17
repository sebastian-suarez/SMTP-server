import net, { type Socket } from "node:net";

enum States {
	CONNECTED,
	HELO,
	MAIL_FROM,
	RCPT_TO,
	DATA,
	QUIT,
}

function process(socket: Socket) {
	let state = States.CONNECTED;
	let from: string;
	let to: string;
	const message: string[] = [];

	socket.write("220 Welcome to the SMTP server\r\n");

	socket.on("data", (data) => {
		const message = data.toString().trim();

		const [command, ...args] = message.split(" ");

		switch (state) {
			case States.CONNECTED: {
				if (["HELO", "EHLO"].includes(command)) {
					state = States.HELO;
					socket.write(`250 Hello ${args[0]}\r\n`);
				}

				break;
			}

			case States.HELO: {
				state = States.MAIL_FROM;
				from = args[0].split(":")[1];
				socket.write("250 OK\r\n");
				break;
			}

			case States.MAIL_FROM: {
				state = States.RCPT_TO;
				socket.write("250 OK\r\n");
				break;
			}

			case States.RCPT_TO: {
				state = States.DATA;
				socket.write("250 OK\r\n");
				break;
			}

			case States.DATA: {
				socket.write("354 Start mail input");
				break;
			}

			case States.QUIT: {
				socket.end("221 Bye\r\n");
				break;
			}
		}
	});

	socket.on("end", () => {
		console.log("Client disconnected");
	});
}

export default process;
