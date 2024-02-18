import { WebSocket } from "ws";
import { Game } from "./dataBase/Game";
import { Room } from "./dataBase/Room";
import { User } from "./dataBase/User";

export enum reqTypes {
  Reg = "reg",
  NewRoom = "create_room",
  NewGame = "create_game",
  AddToRoom = "add_user_to_room",
  Winners = "update_winners",
  Rooms = "update_room",
  AddShips = "add_ships",
  Start = "start_game",
}

export type ControllerMethods = Exclude<
  reqTypes,
  reqTypes.Start | reqTypes.NewGame
>;

export enum errMsgs {
  noErr = "",
  unexpected = "Unexpected server error.",
  userExist = "Wrong password.",
}

export interface Request {
  type: reqTypes;
  data: UserData | RoomIndex | Ships;
  id: 0;
}

export interface UserData {
  name: string;
  password: string;
}

export interface RoomIndex {
  indexRoom: number;
}

export interface ResData {
  name: string;
  index: number;
  error: boolean;
  errorText: errMsgs;
}

export interface NewGameRes {
  idGame: number;
  idPlayer: number;
}

export interface StartGameRes {
  ships: Ship[];
  currentPlayerIndex: 0 | 1;
}

export interface Ships {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

export interface Ship {
  health: number;
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: string;
}

export interface Player {
  playerId: 1 | 0;
  userObj: User;
  ships: null | Ship[];
  playerMap: null | BoardCell[][];
}

export interface BoardCell {
  shipIndex: number;
  fired: boolean;
}

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
