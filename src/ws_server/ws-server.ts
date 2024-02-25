import { Server } from "ws";
import { httpServer } from "../http_server";
import { heartbeat, unpackReq } from "./utils";
import { gameController } from "../controller/controller";
import {
  Hit,
  IOwnWebSocket,
  RandomHit,
  RoomIndex,
  Ships,
  UserData,
  reqTypes,
} from "../types";

export const wss = new Server({
  server: httpServer,
  clientTracking: true,
});

wss.on("connection", (ws: IOwnWebSocket) => {
  console.log("Websocket connection succesfully established.");

  ws.isAlive = true;
  ws.on("pong", () => heartbeat(ws));

  ws.on("message", (data) => {
    const parsedReq = unpackReq(data);
    if (parsedReq.type === reqTypes.Reg) {
      gameController[parsedReq.type](ws, parsedReq.data as UserData);
    } else if (parsedReq.type === reqTypes.AddToRoom) {
      gameController[parsedReq.type](ws, parsedReq.data as RoomIndex);
    } else if (parsedReq.type === reqTypes.AddShips) {
      gameController[parsedReq.type](ws, parsedReq.data as Ships);
    } else if (parsedReq.type === reqTypes.Attack) {
      gameController[parsedReq.type](ws, parsedReq.data as Hit);
    } else if (parsedReq.type === reqTypes.Random) {
      gameController[parsedReq.type](ws, parsedReq.data as RandomHit);
    } else if (
      parsedReq.type !== reqTypes.Finish &&
      parsedReq.type !== reqTypes.Start &&
      parsedReq.type !== reqTypes.Turn &&
      parsedReq.type !== reqTypes.NewGame
    ) {
      gameController[parsedReq.type](ws);
    }
  });
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if ("isAlive" in ws) {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    }
  });
}, 2000);

wss.on("close", function close() {
  clearInterval(interval);
});
