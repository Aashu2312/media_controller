import { io } from "socket.io-client";
const socket = io("http://10.105.77.247:3000", {
  transports: ["websocket"],
});
function App() {
  const sendPlayPause = () => {
    console.log("BUTTON CLICKED");

    socket.emit("play-pause");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        onClick={sendPlayPause}
        style={{
          padding: "20px 40px",
          fontSize: "24px",
          borderRadius: "12px",
        }}
      >
        PLAY / PAUSE
      </button>
    </div>
  );
}

export default App;