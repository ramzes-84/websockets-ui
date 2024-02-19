import { RawData } from "ws";
import {
  NewGameRes,
  Request,
  ResData,
  StartGameRes,
  TurnInfo,
  reqTypes,
} from "../types";
import { Room } from "../dataBase/Room";
import { User } from "../dataBase/User";

export const unpackReq = (data: RawData): Request => {
  const req = JSON.parse(data as unknown as string);
  let reqData;
  try {
    reqData = JSON.parse(req.data as unknown as string);
  } catch (error) {
    reqData = "";
  }
  return { ...req, data: reqData };
};

export const packRes = (
  type: reqTypes,
  data: ResData | User[] | Room[] | NewGameRes | StartGameRes | TurnInfo
): string => {
  const stringifiedData = JSON.stringify(data);
  const response = { type, data: stringifiedData, id: 0 };
  return JSON.stringify(response);
};
