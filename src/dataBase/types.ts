export interface User {
  id: number;
  name: string;
  password: string;
  wins: number;
}

export interface Room {
  id: number;
  playerOne: User;
  playerTwo?: User;
}
export interface DataBase {
  users: User[];
  rooms: Room[];
}
