import { dataBase } from "../dataBase/dataBase";
import { GameRequest, reqTypes } from "../ws_server/types";
import { WebSocket } from "ws";
import { resCompiler } from "../ws_server/utils";

export const gameController = {
  [reqTypes.Reg](req: GameRequest, ws: WebSocket) {
    const newUser = { ...req.data, id: Date.now() };
    dataBase.users.push(newUser);
    const userDataRes = {
      name: newUser.name,
      index: newUser.id,
      error: false,
      errorText: "",
    };
    console.log(resCompiler(reqTypes.Reg, userDataRes));
    ws.send(resCompiler(reqTypes.Reg, userDataRes));
  },
};
