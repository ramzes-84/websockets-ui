import { WebSocket } from "ws";
import { Room } from "./Room";

export interface IUser {
  id: number;
  name: string;
  password: string;
  wins: number;
  ownWS: IOwnWebSocket;
}

// export interface IRoom {
//   id: number;
//   roomUsers: RoomUsers[];
// }

export interface RoomUsers {
  index: number;
  name: string;
}

export interface DataBase {
  users: IUser[];
  rooms: Room[];
}

export interface IOwnWebSocket extends WebSocket {
  userName: string;
  userIndex: number;
}
