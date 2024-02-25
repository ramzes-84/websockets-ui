import { RoomUsers } from "../types";
import { User } from "./User";

export class Room {
  roomId: number;
  roomUsers: RoomUsers[];

  static roomIndex = 0;

  constructor(creator: User) {
    Room.roomIndex++;
    this.roomId = Room.roomIndex;
    const firstPlayer: RoomUsers = { index: creator.id, name: creator.name };
    this.roomUsers = [firstPlayer];
  }
}
