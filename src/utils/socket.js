// frontend/src/utils/socket.js
// frontend/src/utils/socket.js
import { io } from "socket.io-client";

export const socket = io("https://youguybackend.vercel.app:8001", {
  withCredentials: true,
  transports: ["websocket", "polling"] // Ajoutez cette ligne
});
