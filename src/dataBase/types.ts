import { WebSocket } from "ws";
import { Room } from "./Room";
import { User } from "./User";
import { Game } from "./Game";

export interface RoomUsers {
  index: number;
  name: string;
}

export interface DataBase {
  users: User[];
  rooms: Room[];
  games: Game[];
}

export interface IOwnWebSocket extends WebSocket {
  userName: string;
  userIndex: number;
}

export interface Player extends User {
  playerId: 1 | 2;
}
