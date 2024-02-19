import { dB } from "../dataBase/dataBase";
import {
  AttackFeedbackRes,
  BoardCell,
  Hit,
  IOwnWebSocket,
  NewGameRes,
  RoomIndex,
  Ships,
  Status,
  UserData,
  reqTypes,
} from "../types";
import { packRes } from "../ws_server/utils";
import {
  createLoginRes,
  createPlayerMap,
  emitEvent,
  isCorrectPassw,
  isRegisteredUser,
} from "./utils";
import { Room } from "../dataBase/Room";
import { Game } from "../dataBase/Game";

export const gameController = {
  [reqTypes.AddShips](ws: IOwnWebSocket, ships: Ships) {
    const game = dB.games.find((game) => game.idGame === ships.gameId);
    if (game) {
      game.players[ships.indexPlayer].ships = ships.ships;
      game.players[ships.indexPlayer].playerMap = createPlayerMap(ships);
      if (game.players.every((player) => !!player.playerMap === true)) {
        emitEvent(reqTypes.Start, dB, game);
        emitEvent(reqTypes.Turn, dB, game);
      }
    }
  },
  [reqTypes.Attack](ws: IOwnWebSocket, { x, y, gameId, indexPlayer }: Hit) {
    const game = dB.games.find((game) => game.idGame === gameId);
    const attackedPlayer =
      indexPlayer === 0 ? game?.players[1] : game?.players[0];
    if (game && attackedPlayer?.playerMap) {
      const cell = attackedPlayer.playerMap[x][y] as BoardCell;
      cell.fired = true;
      if (cell.shipIndex >= 0) {
        const ship = attackedPlayer.ships![cell.shipIndex];
      } else {
        const attackFeedback: AttackFeedbackRes = {
          position: {
            x,
            y,
          },
          currentPlayer: attackedPlayer.playerId,
          status: Status.miss,
        };
      }
    }
  },
  [reqTypes.Turn]() {}, //REMOVE
  [reqTypes.Start]() {}, //REMOVE
  [reqTypes.NewGame]() {}, //REMOVE
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
      game.players.forEach((user) => {
        const res: NewGameRes = {
          idGame: game.idGame,
          idPlayer: user.playerId,
        };
        user.userObj.ownWS.send(packRes(reqTypes.NewGame, res));
      });
    }
  },
};
