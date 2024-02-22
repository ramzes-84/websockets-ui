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
  Turn = "turn",
  Attack = "attack",
  Random = "randomAttack",
}

export enum errMsgs {
  noErr = "",
  unexpected = "Unexpected server error.",
  userExist = "Wrong password.",
}

export interface Request {
  type: reqTypes;
  data: UserData | RoomIndex | Ships | TurnInfo | Hit;
  id: 0;
}

export interface RandomHit {
  gameId: number;
  indexPlayer: 1 | 0;
}

export interface Hit extends RandomHit {
  x: number;
  y: number;
}

export enum Status {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}

export interface AttackFeedbackRes {
  position: Position;
  currentPlayer: 0 | 1;
  status: Status;
}

export interface TurnInfo {
  currentPlayer: number;
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

export interface Ships extends RandomHit {
  ships: Ship[];
}

type Position = {
  x: number;
  y: number;
};

export interface Ship {
  health: number;
  position: Position;
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
