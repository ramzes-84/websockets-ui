import { httpServer } from "./http_server";
import "./ws_server/ws-server";

const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

// const s = {
//   gameId: 1,
//   ships: [
//     {
//       position: { x: 6, y: 4 },
//       direction: true,
//       type: "huge",
//       length: 4,
//     },
//     {
//       position: { x: 3, y: 3 },
//       direction: true,
//       type: "large",
//       length: 3,
//     },
//     {
//       position: { x: 0, y: 7 },
//       direction: false,
//       type: "large",
//       length: 3,
//     },
//     {
//       position: { x: 5, y: 0 },
//       direction: true,
//       type: "medium",
//       length: 2,
//     },
//     {
//       position: { x: 0, y: 4 },
//       direction: false,
//       type: "medium",
//       length: 2,
//     },
//     {
//       position: { x: 8, y: 3 },
//       direction: false,
//       type: "medium",
//       length: 2,
//     },
//     {
//       position: { x: 4, y: 7 },
//       direction: true,
//       type: "small",
//       length: 1,
//     },
//     {
//       position: { x: 8, y: 8 },
//       direction: false,
//       type: "small",
//       length: 1,
//     },
//     {
//       position: { x: 0, y: 9 },
//       direction: false,
//       type: "small",
//       length: 1,
//     },
//     {
//       position: { x: 5, y: 9 },
//       direction: true,
//       type: "small",
//       length: 1,
//     },
//   ],
//   indexPlayer: 2,
// };
