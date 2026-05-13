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

 socket.on("media-command", (command) => {
  console.log("COMMAND:", command);

  io.emit("trigger-media-command", command);
});


  socket.on("disconnect", () => {
    console.log("DEVICE DISCONNECTED");
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT 3000");
});