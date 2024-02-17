import { dB } from "../dataBase/dataBase";
import { NewGameRes, RoomIndex, UserData, reqTypes } from "../ws_server/types";
import { packRes } from "../ws_server/utils";
import {
  createLoginRes,
  emitEvent,
  isCorrectPassw,
  isRegisteredUser,
} from "./utils";
import { IOwnWebSocket } from "../dataBase/types";
import { Room } from "../dataBase/Room";
import { Game } from "../dataBase/Game";

export const gameController = {
  [reqTypes.NewGame]() {},
  [reqTypes.Reg](ws: IOwnWebSocket, newUserData: UserData) {
    const registeredUser = isRegisteredUser(newUserData, dB.users);
    const userWithPassw = isCorrectPassw(newUserData, dB.users);
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
    emitEvent(reqTypes.Winners, dB);
  },
  [reqTypes.Rooms]() {
    emitEvent(reqTypes.Rooms, dB);
  },
  [reqTypes.NewRoom](ws: IOwnWebSocket) {
    const creator = dB.users.find((user) => user.id === ws.userIndex);
    creator && dB.rooms.push(new Room(creator));
    this[reqTypes.Rooms]();
  },
  [reqTypes.AddToRoom](ws: IOwnWebSocket, roomIndex: RoomIndex) {
    const roomIndexInArr = dB.rooms.findIndex(
      (room) => room.roomId === roomIndex.indexRoom
    );
    const playerOne = dB.users.find(
      (user) => user.id === dB.rooms[roomIndexInArr].roomUsers[0].index
    );
    const playerTwo = dB.users.find((user) => user.id === ws.userIndex);
    if (playerOne && playerTwo) {
      const game = new Game(playerOne, playerTwo);
      dB.games.push(game);
      dB.rooms.splice(roomIndexInArr, 1);
      this[reqTypes.Rooms]();
      [game.playerOne, game.playerTwo].forEach((user) => {
        const res: NewGameRes = {
          idGame: game.idGame,
          idPlayer: user.playerId,
        };
        user.ownWS.send(packRes(reqTypes.NewGame, res));
      });
    }
  },
};
