const express = require("express");
const http = require("http");
const{ Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin: "*",
    },
});
io.on("connection", (socket)=>  {
    console.log("Phone connected:", socket.id);

    socket.on("play-pause", () =>{
        console.log("PLAY/PAUSE command recieved");

        io.emit("trigger-play-pause");
    });

    socket.on("disconnect", ()=>{
        console.log("Disconnected");

    });

});

server.listen(3000, "0.0.0.0", ()=>{
    console.log("server running on prot 3000");
})