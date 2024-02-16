import { Server } from "ws";
import { httpServer } from "../http_server";
import { unpackReq } from "./utils";
import { gameController } from "../controller/controller";

export const wss = new Server({
  server: httpServer,
});

wss.on("connection", (ws) => {
  console.log("Websocket connection succesfully established.");

  ws.on("message", (data) => {
    const parsedReq = unpackReq(data);
    gameController[parsedReq.type](parsedReq.data, ws);
  });
});
