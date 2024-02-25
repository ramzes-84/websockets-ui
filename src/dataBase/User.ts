import { IOwnWebSocket, UserData } from "../types";

export class User {
  name: string;
  password: string;
  id: number;
  wins: number;
  ownWS: IOwnWebSocket;
  isBot: boolean;

  static userIndex = 0;

  constructor(newUserData: UserData, ws: IOwnWebSocket, isBot?: true) {
    User.userIndex++;
    this.name = newUserData.name;
    this.password = newUserData.password;
    this.id = User.userIndex;
    this.wins = 0;
    this.ownWS = ws;
    this.ownWS.userIndex = this.id;
    this.ownWS.userName = this.name;
    this.isBot = isBot || false;
  }
}
