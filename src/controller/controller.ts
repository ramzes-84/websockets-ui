import { dataBase } from "../dataBase/dataBase";
import { ResData, UserData, errMsgs, reqTypes } from "../ws_server/types";
import { WebSocket } from "ws";
import { packRes } from "../ws_server/utils";
import { createLoginRes, isCorrectPassw, isRegisteredUser } from "./utils";

export const gameController = {
  [reqTypes.Reg](newUserData: UserData, ws: WebSocket) {
    const registeredUser = isRegisteredUser(newUserData, dataBase.users);
    const userWithPassw = isCorrectPassw(newUserData, dataBase.users);
    const res = createLoginRes({ registeredUser, userWithPassw, newUserData });
    ws.send(packRes(reqTypes.Reg, res));
  },
  [reqTypes.NewRoom]() {},
  [reqTypes.AddToRoom]() {},
};
