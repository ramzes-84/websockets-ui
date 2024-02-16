import { RawData } from "ws";
import { Request, ResData, reqTypes } from "./types";
import { User } from "../dataBase/types";

export const unpackReq = (data: RawData): Request => {
  const req = JSON.parse(data as unknown as string);
  const reqData = JSON.parse(req.data as unknown as string);
  return { ...req, data: reqData };
};

export const packRes = (type: reqTypes, data: ResData): string => {
  const stringifiedData = JSON.stringify(data);
  const response = { type, data: stringifiedData, id: 0 };
  return JSON.stringify(response);
};
