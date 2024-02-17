import { User } from "./User";
import { Player } from "./types";

export class Game {
  idGame: number;
  playerOne: Player;
  playerTwo: Player;

  static gameIndex = 0;

  constructor(host: User, visitor: User) {
    Game.gameIndex++;
    this.idGame = Game.gameIndex;
    this.playerOne = { ...host, playerId: 1 };
    this.playerTwo = { ...visitor, playerId: 2 };
  }
}
