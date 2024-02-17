import { UserData } from "../ws_server/types";

export class UserCreator {
  name: string;
  password: string;
  id: number;
  wins: number;

  constructor(newUserData: UserData) {
    this.name = newUserData.name;
    this.password = newUserData.password;
    this.id = Date.now();
    this.wins = 0;
  }
}
