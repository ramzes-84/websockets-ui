import { UserCreator } from "../dataBase/User";
import { dataBase } from "../dataBase/dataBase";
import { User } from "../dataBase/types";
import { ResData, UserData, errMsgs } from "../ws_server/types";

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

export const createLoginRes = ({
  registeredUser,
  userWithPassw,
  newUserData,
}: {
  registeredUser: false | User;
  userWithPassw: false | User;
  newUserData: UserData;
}) => {
  let userDataRes: ResData = {
    name: "",
    index: 0,
    error: true,
    errorText: errMsgs.unexpected,
  };
  if (registeredUser && userWithPassw) {
    userDataRes = {
      name: userWithPassw.name,
      index: userWithPassw.id,
      error: false,
      errorText: errMsgs.noErr,
    };
  } else if (registeredUser && !userWithPassw) {
    userDataRes = {
      name: registeredUser.name,
      index: registeredUser.id,
      error: true,
      errorText: errMsgs.userExist,
    };
  } else {
    const newUser = new UserCreator(newUserData);
    dataBase.users.push(newUser);
    userDataRes = {
      name: newUser.name,
      index: newUser.id,
      error: false,
      errorText: errMsgs.noErr,
    };
  }
  return userDataRes;
};
