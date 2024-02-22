import { dB } from "../dataBase/dataBase";
import {
  BoardCell,
  Hit,
  IOwnWebSocket,
  NewGameRes,
  Player,
  RandomHit,
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
  generateCoords,
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
    if (game?.isHostsTurn === !indexPlayer) {
      const attackedPlayer =
        indexPlayer === 0 ? game?.players[1] : game?.players[0];
      if (game && attackedPlayer?.playerMap) {
        const cell = attackedPlayer.playerMap[x][y] as BoardCell;
        cell.fired = true;
        if (cell.shipIndex >= 0) {
          const ship = attackedPlayer.ships![cell.shipIndex];
          let status: Status = Status.shot;
          if (ship.health > 1) {
            status = Status.shot;
          } else if (ship.health === 1) {
            status = Status.killed;
          }
          ship.health -= 1;
          game.players.forEach((player) => {
            player.userObj.ownWS.send(
              packRes(reqTypes.Attack, {
                position: { x, y },
                currentPlayer: indexPlayer,
                status,
              })
            );
          });
          emitEvent(reqTypes.Turn, dB, game);
        } else {
          game.players.forEach((player) => {
            player.userObj.ownWS.send(
              packRes(reqTypes.Attack, {
                position: { x, y },
                currentPlayer: indexPlayer,
                status: Status.miss,
              })
            );
          });
          game.isHostsTurn = !game.isHostsTurn;
          emitEvent(reqTypes.Turn, dB, game);
        }
      }
    }
  },
  [reqTypes.Random](ws: IOwnWebSocket, { gameId, indexPlayer }: RandomHit) {
    const game = dB.games.find((game) => game.idGame === gameId);
    const attackedPlayer =
      indexPlayer === 0 ? game?.players[1] : game?.players[0];
    if (game && attackedPlayer) {
      let { x, y } = generateCoords();
      while (attackedPlayer.playerMap![x][y].fired) {
        ({ x, y } = generateCoords());
      }
      this[reqTypes.Attack](ws, { x, y, gameId, indexPlayer });
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
