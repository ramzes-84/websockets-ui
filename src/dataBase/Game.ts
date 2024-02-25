import { Player } from "../types";
import { User } from "./User";

export class Game {
  idGame: number;
  isHostsTurn: boolean;
  players: [Player, Player];

  static gameIndex = 0;

  constructor(host: User, visitor: User) {
    Game.gameIndex++;
    this.idGame = Game.gameIndex;
    this.isHostsTurn = true;
    this.players = [
      { playerId: 0, ships: null, playerMap: null, userObj: host },
      { playerId: 1, ships: null, playerMap: null, userObj: visitor },
    ];
  }
}
