import { io } from "socket.io-client";

const socket = io("http://10.105.77.247:3000", {
  transports: ["websocket"],
});

function sendCommand(type) {
  socket.emit("media-command", { type });
}

function App() {
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