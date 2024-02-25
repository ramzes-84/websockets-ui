import { dB } from "../dataBase/dataBase";
import {
  BoardCell,
  Hit,
  IOwnWebSocket,
  NewGameRes,
  RandomHit,
  RoomIndex,
  Ships,
  Status,
  UserData,
  reqTypes,
} from "../types";
import { packRes } from "../ws_server/utils";
import {
  auraCreator,
  createLoginRes,
  createPlayerMap,
  emitEvent,
  generateCoords,
  isCorrectPassw,
  isRegisteredUser,
  removeBotFromUsers,
} from "./utils";
import { Room } from "../dataBase/Room";
import { Game } from "../dataBase/Game";
import { User } from "../dataBase/User";

export const gameController = {
  [reqTypes.Single](ws: IOwnWebSocket) {
    const roomIndex = this[reqTypes.NewRoom](ws);
    const bot = new User(
      { name: "MegaBot", password: "" },
      {
        ...ws,
      } as IOwnWebSocket,
      true
    );
    dB.users.push(bot);
    this[reqTypes.AddToRoom](bot.ownWS, { indexRoom: roomIndex });
  },
  [reqTypes.AddShips](ws: IOwnWebSocket, ships: Ships) {
    const game = dB.games.find((game) => game.idGame === ships.gameId);
    if (!game) throw new Error("Game not found.");
    game.players[ships.indexPlayer].ships = ships.ships;
    game.players[ships.indexPlayer].playerMap = createPlayerMap(ships);
    if (game.players[1].userObj.isBot) {
      const botShips = ships.ships.map((ship) => {
        let {
          position: { x, y },
          direction,
        } = ship;
        direction = !direction;
        [x, y] = [y, x];
        return { ...ship, position: { x, y }, direction };
      });
      game.players[1].ships = botShips;
      game.players[1].playerMap = createPlayerMap({ ships: botShips } as Ships);
    }
    if (game.players.every((player) => !!player.playerMap === true)) {
      emitEvent(reqTypes.Start, { dB, game });
      emitEvent(reqTypes.Turn, { dB, game });
    }
  },
  [reqTypes.Attack](ws: IOwnWebSocket, { x, y, gameId, indexPlayer }: Hit) {
    const game = dB.games.find((game) => game.idGame === gameId);
    if (!game) throw new Error("Game not found.");
    if (game.isHostsTurn === !indexPlayer) {
      const attackedPlayer =
        indexPlayer === 0 ? game.players[1] : game.players[0];
      if (attackedPlayer?.playerMap) {
        const cell = attackedPlayer.playerMap[x][y] as BoardCell;
        cell.fired = true;
        if (cell.shipIndex >= 0) {
          const ship = attackedPlayer.ships![cell.shipIndex];
          const status: Status = ship.health > 1 ? Status.shot : Status.killed;
          ship.health -= 1;
          game.players.forEach((player) => {
            if (!player.userObj.isBot)
              player.userObj.ownWS.send(
                packRes(reqTypes.Attack, {
                  position: { x, y },
                  currentPlayer: indexPlayer,
                  status,
                })
              );
          });
          if (status === Status.killed) {
            const killedShipAura = auraCreator(attackedPlayer, ship);
            killedShipAura.forEach(({ x, y }) => {
              game.players.forEach((player) => {
                if (!player.userObj.isBot)
                  player.userObj.ownWS.send(
                    packRes(reqTypes.Attack, {
                      position: { x, y },
                      currentPlayer: indexPlayer,
                      status: Status.miss,
                    })
                  );
              });
            });
          }
          const isPlayerDead = attackedPlayer.ships!.every(
            (ship) => ship.health === 0
          );
          if (isPlayerDead) {
            emitEvent(reqTypes.Finish, { game, winPlayer: indexPlayer });
            game.players[indexPlayer].userObj.wins += 1;
            if (attackedPlayer.userObj.isBot)
              dB.users = removeBotFromUsers(attackedPlayer.userObj.id, dB);
            this[reqTypes.Winners]();
          } else {
            emitEvent(reqTypes.Turn, { dB, game });
            if (!game.isHostsTurn && game.players[1].userObj.isBot) {
              setTimeout(() => {
                this[reqTypes.Random](ws, {
                  gameId: game.idGame,
                  indexPlayer: 1,
                });
              }, 2000);
            }
          }
        } else {
          game.players.forEach((player) => {
            if (!player.userObj.isBot)
              player.userObj.ownWS.send(
                packRes(reqTypes.Attack, {
                  position: { x, y },
                  currentPlayer: indexPlayer,
                  status: Status.miss,
                })
              );
          });
          game.isHostsTurn = !game.isHostsTurn;
          emitEvent(reqTypes.Turn, { dB, game });
          if (!game.isHostsTurn && game.players[1].userObj.isBot) {
            setTimeout(() => {
              this[reqTypes.Random](ws, {
                gameId: game.idGame,
                indexPlayer: 1,
              });
            }, 2000);
          }
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
    const users = dB.users
      .filter((user) => user.wins > 0)
      .sort((a, b) => b.wins - a.wins);
    const sortedDB = { ...dB, users };
    emitEvent(reqTypes.Winners, { dB: sortedDB });
  },
  [reqTypes.Rooms]() {
    emitEvent(reqTypes.Rooms, { dB });
  },
  [reqTypes.NewRoom](ws: IOwnWebSocket) {
    const creator = dB.users.find((user) => user.id === ws.userIndex);
    creator && dB.rooms.push(new Room(creator));
    this[reqTypes.Rooms]();
    return Room.roomIndex;
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
        if (!user.userObj.isBot)
          user.userObj.ownWS.send(packRes(reqTypes.NewGame, res));
      });
    }
  },
};
