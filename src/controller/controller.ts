import { dataBase } from "../dataBase/dataBase";
import { ResData, UserData, errMsgs, reqTypes } from "../ws_server/types";
import { WebSocket } from "ws";
import { resCompiler } from "../ws_server/utils";
import { isCorrectPassw, isRegisteredUser } from "./utils";

export const gameController = {
  [reqTypes.Reg](user: UserData, ws: WebSocket) {
    const doesUserExist = isRegisteredUser(user, dataBase.users);
    const userWithPassw = isCorrectPassw(user, dataBase.users);
    let userDataRes: ResData = {
      name: "",
      index: 0,
      error: true,
      errorText: errMsgs.unexpected,
    };
    if (doesUserExist && userWithPassw) {
      userDataRes = {
        name: userWithPassw.name,
        index: userWithPassw.id,
        error: false,
        errorText: errMsgs.noErr,
      };
    } else if (doesUserExist && !userWithPassw) {
      userDataRes = {
        name: doesUserExist.name,
        index: doesUserExist.id,
        error: true,
        errorText: errMsgs.userExist,
      };
    } else {
      const newUser = { ...user, id: Date.now() };
      dataBase.users.push(newUser);
      userDataRes = {
        name: newUser.name,
        index: newUser.id,
        error: false,
        errorText: errMsgs.noErr,
      };
    }
    ws.send(resCompiler(reqTypes.Reg, userDataRes));
  },
};
