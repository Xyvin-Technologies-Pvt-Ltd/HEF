const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

const chatNamespace = io.of("/api/v1/chat");

const userSocketMap = new Map();

const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

chatNamespace.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  socket.on("joinRoom", (roomId) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    socket.join(roomId);
  });

  chatNamespace.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    userSocketMap.delete(userId);
    chatNamespace.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

module.exports = { app, server, io, chatNamespace, getReceiverSocketId };
