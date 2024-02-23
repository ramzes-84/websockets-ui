import { httpServer } from "./http_server";
import "./ws_server/ws-server";

const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
console.log(`Websocket server is waiting on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
