import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const sendPlayPause = () => {
    console.log("clicked");
    // alert("BUTTON WORKING");
    socket.emit("play-pause");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
      }}
    >
      <button
        onClick={sendPlayPause}
        style={{
          padding: "20px 40px",
          fontSize: "24px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
        }}
      >
        PLAY / PAUSE
      </button>
    </div>
  );
}

export default App;