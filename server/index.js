const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("DEVICE CONNECTED:", socket.id);

  socket.on("play-pause", () => {
    console.log("PLAY/PAUSE COMMAND RECEIVED");

    io.emit("trigger-play-pause");
  });

  socket.on("disconnect", () => {
    console.log("DEVICE DISCONNECTED");
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT 3000");
});