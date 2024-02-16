import { User } from "../dataBase/types";
import { UserData } from "../ws_server/types";

// export const isUserData = (obj: object): obj is UserData => {
//   if ("name" in obj && "password" in obj) {
//     if (typeof obj.name === "string" && typeof obj.password === "string") {
//       return true;
//     }
//   }
//   return false;
// };

export const isRegisteredUser = (
  user: UserData,
  users: User[]
): false | User => {
  const foundUser = users.find((item) => item.name === user.name);
  if (foundUser) return foundUser;
  return false;
};

export const isCorrectPassw = (user: UserData, users: User[]): false | User => {
  const foundUser = users.find((item) => item.name === user.name);
  if (foundUser?.password === user.password) return foundUser;
  return false;
};
