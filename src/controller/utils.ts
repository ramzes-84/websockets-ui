import { User } from "../dataBase/User";
import { dB } from "../dataBase/dataBase";
import {
  BoardCell,
  DataBase,
  EmitEventParams,
  IOwnWebSocket,
  Player,
  Position,
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

export const emitEvent = (
  type: reqTypes,
  { dB, game, winPlayer }: EmitEventParams
) => {
  if (type === reqTypes.Winners && dB) {
    dB.users.forEach((user) => {
      if (!user.isBot) user.ownWS.send(packRes(type, dB.users));
    });
  }
  if (type === reqTypes.Rooms && dB) {
    dB.users.forEach((user) => {
      if (!user.isBot) user.ownWS.send(packRes(type, dB.rooms));
    });
  }
  if (type === reqTypes.Turn && game) {
    game.players.forEach((player) => {
      const turnInfoRes: TurnInfo = {
        currentPlayer: game.isHostsTurn ? 0 : 1,
      };
      if (!player.userObj.isBot)
        player.userObj.ownWS.send(packRes(type, turnInfoRes));
    });
  }
  if (type === reqTypes.Start && game) {
    game.players.forEach((player) => {
      const startGameRes: StartGameRes = {
        ships: player.ships as Ship[],
        currentPlayerIndex: player.playerId,
      };
      if (!player.userObj.isBot)
        player.userObj.ownWS.send(packRes(type, startGameRes));
    });
  }
  if (type === reqTypes.Finish && game && typeof winPlayer == "number") {
    game.players.forEach((player) => {
      if (!player.userObj.isBot)
        player.userObj.ownWS.send(
          packRes(type, {
            winPlayer,
          })
        );
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

export const generateCoords = () => {
  const min = 0;
  const max = 10;
  const x = Math.floor(Math.random() * (max - min) + min);
  const y = Math.floor(Math.random() * (max - min) + min);
  return { x, y };
};

export const auraCreator = (
  { playerMap }: Player,
  { direction, length, position }: Ship
) => {
  const killedShipAura: Position[] = [];
  for (let i = -1; i < length + 1; i++) {
    for (let j = -1; j < 2; j++) {
      const x = position.x + (direction ? j : i);
      const y = position.y + (direction ? i : j);
      const cell = playerMap![x]?.[y];

      if (!cell) continue;
      if (!cell.fired) {
        cell.fired = !cell.fired;
        killedShipAura.push({ x, y });
      }
    }
  }
  return killedShipAura;
};

export const removeBotFromUsers = (botId: number, dB: DataBase) => {
  const users = dB.users.filter((user) => user.id !== botId);
  return users;
};
