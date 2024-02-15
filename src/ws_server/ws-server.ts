import http from "http";
import { Server, WebSocketServer } from "ws";
import { httpServer } from "../http_server";

export const wss = new Server({
  server: httpServer,
});

wss.on("connection", (ws) => {
  console.log("Websocket connection succesfully established.");

  ws.on("message", (data) => {
    console.log("received: %s", data);
  });
});
