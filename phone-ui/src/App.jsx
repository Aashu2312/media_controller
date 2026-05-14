import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import { SERVER_URL } from "../../config";

const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

function sendCommand(type) {
  socket.emit("media-command", { type });
}

function App() {
  const [mediaInfo, setMediaInfo] = useState(null);

  useEffect(() => {
    socket.on("media-update", (data) => {
      console.log("MEDIA UPDATE:", data);

      setMediaInfo(data);
    });

    return () => {
      socket.off("media-update");
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {mediaInfo && (
        <div>
          <h2>{mediaInfo.title}</h2>

          <p>
            {mediaInfo.paused ? "Paused" : "Playing"}
          </p>

          <p>
            {Math.floor(mediaInfo.currentTime)} /
            {Math.floor(mediaInfo.duration)}
          </p>

          <p>
            Volume: {Math.floor(mediaInfo.volume * 100)}%
          </p>
        </div>
      )}

      <button onClick={() => sendCommand("PLAY_PAUSE")}>
        PLAY / PAUSE
      </button>

      <button onClick={() => sendCommand("VOLUME_UP")}>
        VOLUME +
      </button>

      <button onClick={() => sendCommand("VOLUME_DOWN")}>
        VOLUME -
      </button>

      <button onClick={() => sendCommand("SEEK_FORWARD")}>
        SEEK +10s
      </button>

      <button onClick={() => sendCommand("SEEK_BACKWARD")}>
        SEEK -10s
      </button>
    </div>
  );
}

export default App;