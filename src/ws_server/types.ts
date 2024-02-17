export enum reqTypes {
  Reg = "reg",
  NewRoom = "create_room",
  NewGame = "create_game",
  AddToRoom = "add_user_to_room",
  Winners = "update_winners",
  Rooms = "update_room",
}

export enum errMsgs {
  noErr = "",
  unexpected = "Unexpected server error.",
  userExist = "Wrong password.",
}

export interface Request {
  type: reqTypes;
  data: UserData | RoomIndex;
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
