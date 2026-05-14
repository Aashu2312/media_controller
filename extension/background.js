import { io } from "./node_modules/socket.io-client/dist/socket.io.esm.min.js";
console.log(io);

console.log("BACKGROUND RUNNING");

const SERVER_URL = "http://10.105.77.247:3000";
const socket = io(SERVER_URL, {
  transports: ["websocket"],
});
socket.on("connect", () => {
  console.log("CONNECTION MADE");
});

socket.on("connect_error", (error) => {
  console.log("CONNECTION ERROR:", error);
});

socket.on("disconnect", (reason) => {
  console.log("DISCONNECTED:", reason);
});

socket.on("trigger-media-command", (command) => {
  console.log("COMMAND RECEIVED:", command.type);

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (!tabs.length) {
        console.log("NO TAB FOUND");
        return;
      }

      console.log("SENDING TO:", tabs[0].url);
chrome.tabs.sendMessage(tabs[0].id, command, (response) => {
  console.log("MEDIA INFO:", response);

  socket.emit("media-info", response);
});
    }
  );
});
