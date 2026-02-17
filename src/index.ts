import net from "node:net";
import process from "#modules/state.js";

const server = net.createServer(process);

server.listen(2525);
