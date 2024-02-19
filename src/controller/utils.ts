import { Game } from "../dataBase/Game";
import { User } from "../dataBase/User";
import { dB } from "../dataBase/dataBase";
import {
  BoardCell,
  DataBase,
  IOwnWebSocket,
  ResData,
  Ship,
  Ships,
  StartGameRes,
  TurnInfo,
  UserData,
  errMsgs,
  reqTypes,
} from "../types";
import { packRes } from "../ws_server/utils";

export const emitEvent = (type: reqTypes, dB: DataBase, game?: Game) => {
  if (type === reqTypes.Winners) {
    dB.users.forEach((user) => {
      user.ownWS.send(packRes(type, dB.users));
    });
  }
  if (type === reqTypes.Rooms) {
    dB.users.forEach((user) => {
      user.ownWS.send(packRes(type, dB.rooms));
    });
  }
  if (type === reqTypes.Turn && game) {
    game.players.forEach((player) => {
      const turnInfoRes: TurnInfo = {
        currentPlayer: game.isHostsTurn ? 0 : 1,
      };
      player.userObj.ownWS.send(packRes(type, turnInfoRes));
    });
  }
  if (type === reqTypes.Start && game) {
    game.players.forEach((player) => {
      const startGameRes: StartGameRes = {
        ships: player.ships as Ship[],
        currentPlayerIndex: player.playerId,
      };
      player.userObj.ownWS.send(packRes(type, startGameRes));
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

export const createPlayerMap = ({ ships }: Ships): BoardCell[][] => {
  const playerMap = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => ({
      ...{ shipIndex: -1, fired: false },
    }))
  );

  ships.forEach((ship, index) => {
    ship.health = ship.length;

    const { x, y } = ship.position;

    for (let i = 0; i < ship.length; i++) {
      const cell = ship.direction
        ? playerMap[x]?.[y + i]
        : playerMap[x + i]?.[y];

      if (cell && cell.shipIndex === -1) {
        cell.shipIndex = index;
      }
    }
  });
  return playerMap;
};
