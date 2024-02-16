export interface User {
  id: number;
  name: string;
  password: string;
}
export interface DataBase {
  users: User[];
  rooms: [];
}
