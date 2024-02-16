export enum reqTypes {
  Reg = "reg",
}

export enum errMsgs {
  noErr = "",
  unexpected = "Unexpected server error.",
  userExist = "Wrong password.",
}

export interface Request {
  type: reqTypes;
  data: UserData;
  id: 0;
}

export interface UserData {
  name: string;
  password: string;
}

export interface ResData {
  name: string;
  index: number;
  error: boolean;
  errorText: errMsgs;
}
