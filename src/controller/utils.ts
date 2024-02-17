import { User } from "../dataBase/User";
import { dB } from "../dataBase/dataBase";
import { DataBase, IOwnWebSocket } from "../dataBase/types";
import { ResData, UserData, errMsgs, reqTypes } from "../ws_server/types";
import { packRes } from "../ws_server/utils";

export const emitEvent = (type: reqTypes, dB: DataBase) => {
  if (type === reqTypes.Winners) {
    dB.users.forEach((user) => {
      user.ownWS.send(packRes(reqTypes.Winners, dB.users));
    });
  }
  if (type === reqTypes.Rooms) {
    dB.users.forEach((user) => {
      user.ownWS.send(packRes(reqTypes.Rooms, dB.rooms));
    });
  }
};

export const isRegisteredUser = (
  user: UserData,
  users: User[]
): false | User => {
  const foundUser = users.find((item) => item.name === user.name);
  if (foundUser) return foundUser;
  return false;
};

export const isCorrectPassw = (user: UserData, users: User[]): false | User => {
  const foundUser = users.find((item) => item.name === user.name);
  if (foundUser?.password === user.password) return foundUser;
  return false;
};

export const createLoginRes = ({
  registeredUser,
  userWithPassw,
  newUserData,
  ws,
}: {
  registeredUser: false | User;
  userWithPassw: false | User;
  newUserData: UserData;
  ws: IOwnWebSocket;
}) => {
  let userDataRes: ResData = {
    name: "",
    index: 0,
    error: true,
    errorText: errMsgs.unexpected,
  };
  if (registeredUser && userWithPassw) {
    userWithPassw.ownWS = ws;
    userWithPassw.ownWS.userName = userWithPassw.name;
    userWithPassw.ownWS.userIndex = userWithPassw.id;
    userDataRes = {
      name: userWithPassw.name,
      index: userWithPassw.id,
      error: false,
      errorText: errMsgs.noErr,
    };
  } else if (registeredUser && !userWithPassw) {
    userDataRes = {
      name: registeredUser.name,
      index: registeredUser.id,
      error: true,
      errorText: errMsgs.userExist,
    };
  } else {
    const newUser = new User(newUserData, ws);
    dB.users.push(newUser);
    userDataRes = {
      name: newUser.name,
      index: newUser.id,
      error: false,
      errorText: errMsgs.noErr,
    };
  }
  return userDataRes;
};
