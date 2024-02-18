import { Server } from "ws";
import { httpServer } from "../http_server";
import { unpackReq } from "./utils";
import { gameController } from "../controller/controller";
import { IOwnWebSocket, RoomIndex, Ships, UserData, reqTypes } from "../types";

export const wss = new Server({
  server: httpServer,
});

wss.on("connection", (ws: IOwnWebSocket) => {
  console.log("Websocket connection succesfully established.");

  ws.on("message", (data) => {
    const parsedReq = unpackReq(data);
    if (parsedReq.type === reqTypes.Reg) {
      gameController[parsedReq.type](ws, parsedReq.data as UserData);
    } else if (parsedReq.type === reqTypes.AddToRoom) {
      gameController[parsedReq.type](ws, parsedReq.data as RoomIndex);
    } else if (parsedReq.type === reqTypes.AddShips) {
      gameController[parsedReq.type](ws, parsedReq.data as Ships);
    } else gameController[parsedReq.type](ws);
  });
});
