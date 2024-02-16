import { RawData } from "ws";
import { GameRequest, RegRes, reqTypes } from "./types";
import { User } from "../dataBase/types";

export const reqParser = (data: RawData): GameRequest => {
  const req = JSON.parse(data as unknown as string);
  const reqData = JSON.parse(req.data as unknown as string);
  return { ...req, data: reqData };
};

export const resCompiler = (type: reqTypes, data: RegRes): string => {
  const stringifiedData = JSON.stringify(data);
  const response = { type, data: stringifiedData, id: 0 };
  return JSON.stringify(response);
};
