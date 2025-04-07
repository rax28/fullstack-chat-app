import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]; // Retrieve the socket ID for the user
}

//used to store online users
const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId; // Assuming userId is sent as a query parameter
  if (userId) userSocketMap[userId] = socket.id; // Store the socket ID for the user

  //io.emit( ) is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the list of online users to all clients

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId]; // Remove the socket ID for the user
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the updated list of online users
  });
});

export { io, app, server };
