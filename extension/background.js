import { io } from "./node_modules/socket.io-client/dist/socket.io.esm.min.js";

console.log("BACKGROUND RUNNING");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("CONNECTED TO SERVER");
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