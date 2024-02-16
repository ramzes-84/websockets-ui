export enum reqTypes {
  Reg = "reg",
}

export interface GameRequest {
  type: reqTypes;
  data: UserData;
  id: 0;
}

interface UserData {
  name: string;
  password: string;
}

export interface RegRes {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
// export interface ResBeforeStringify extends GameRequest {
//   data: string;
// }
