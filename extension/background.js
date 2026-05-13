import { io } from "./node_modules/socket.io-client/dist/socket.io.esm.min.js";
console.log(io);

console.log("BACKGROUND RUNNING");

const socket = io("http://10.105.77.247:3000", {
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

socket.on("trigger-play-pause", () => {
  console.log("PLAY/PAUSE EVENT RECEIVED");

  chrome.tabs.query(
    {
      url: "*://www.youtube.com/*",
    },
    (tabs) => {
      if (!tabs.length) {
        console.log("NO YOUTUBE TAB FOUND");
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        type: "PLAY_PAUSE",
      });
    }
  );
});
