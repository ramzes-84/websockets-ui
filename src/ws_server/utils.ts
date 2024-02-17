import { RawData } from "ws";
import { Request, ResData, reqTypes } from "./types";
import { IUser } from "../dataBase/types";
import { Room } from "../dataBase/Room";

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
  data: ResData | IUser[] | Room[]
): string => {
  const stringifiedData = JSON.stringify(data);
  const response = { type, data: stringifiedData, id: 0 };
  return JSON.stringify(response);
};
