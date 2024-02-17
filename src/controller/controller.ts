import { dataBase } from "../dataBase/dataBase";
import { UserData, reqTypes } from "../ws_server/types";
import { packRes } from "../ws_server/utils";
import {
  createLoginRes,
  emitEvent,
  isCorrectPassw,
  isRegisteredUser,
} from "./utils";
import { IOwnWebSocket } from "../dataBase/types";
import { Room } from "../dataBase/Room";

export const gameController = {
  [reqTypes.Reg](ws: IOwnWebSocket, newUserData: UserData) {
    const registeredUser = isRegisteredUser(newUserData, dataBase.users);
    const userWithPassw = isCorrectPassw(newUserData, dataBase.users);
    const res = createLoginRes({
      registeredUser,
      userWithPassw,
      newUserData,
      ws,
    });
    ws.send(packRes(reqTypes.Reg, res));
    this[reqTypes.Rooms]();
    this[reqTypes.Winners]();
  },
  [reqTypes.Winners]() {
    emitEvent(reqTypes.Winners, dataBase);
  },
  [reqTypes.Rooms]() {
    emitEvent(reqTypes.Rooms, dataBase);
  },
  [reqTypes.NewRoom](ws: IOwnWebSocket) {
    const creator = dataBase.users.find((user) => user.id === ws.userIndex);
    creator && dataBase.rooms.push(new Room(creator));
    this[reqTypes.Rooms]();
  },
  [reqTypes.AddToRoom]() {},
};
