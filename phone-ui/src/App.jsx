import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import { SERVER_URL } from "../../config";

const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

function formatTime(value) {
  return Number.isFinite(value) ? Math.floor(value) : "--";
}

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [serverStatus, setServerStatus] = useState({
    extensionCount: 0,
    phoneCount: 0,
  });
  const [status, setStatus] = useState(`Connecting to ${SERVER_URL}`);
  const [mediaInfo, setMediaInfo] = useState(null);

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);
      setStatus(`Connected to ${SERVER_URL}`);
      socket.emit("register-client", { role: "phone" });
    }

    function handleDisconnect() {
      setIsConnected(false);
      setStatus(`Disconnected from ${SERVER_URL}`);
    }

    function handleConnectError(error) {
      setIsConnected(false);
      setStatus(`Connection failed: ${error.message}`);
    }

    function handleMediaUpdate(data) {
      console.log("MEDIA UPDATE:", data);

      setMediaInfo(data);
      setStatus(
        data.ok ? `Handled ${data.command}` : `Command failed: ${data.error}`
      );
    }

    function handleServerStatus(data) {
      setServerStatus(data);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("media-update", handleMediaUpdate);
    socket.on("server-status", handleServerStatus);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("media-update", handleMediaUpdate);
      socket.off("server-status", handleServerStatus);
    };
  }, []);

  function sendCommand(type) {
    if (!socket.connected) {
      setStatus(`Not connected to ${SERVER_URL}`);
      return;
    }

    setStatus(`Sending ${type}`);
    socket.emit("media-command", { type });
  }

  const buttonStyle = {
    width: "min(320px, 85vw)",
    padding: "14px 18px",
    borderRadius: "8px",
    border: "1px solid #d4d4d8",
    fontSize: "16px",
    fontWeight: 600,
  };
  const disabled = !isConnected;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          color: isConnected ? "#16a34a" : "#dc2626",
          fontWeight: 700,
        }}
      >
        {isConnected ? "Server connected" : "Server disconnected"}
      </p>

      <p
        style={{
          maxWidth: "320px",
          minHeight: "44px",
          color: mediaInfo?.ok === false ? "#dc2626" : "inherit",
        }}
      >
        {status}
      </p>

      <p
        style={{
          color: serverStatus.extensionCount > 0 ? "#16a34a" : "#dc2626",
          fontWeight: 700,
        }}
      >
        {serverStatus.extensionCount > 0
          ? "Chrome extension connected"
          : "Chrome extension disconnected"}
      </p>

      {mediaInfo && (
        <div
          style={{
            width: "min(360px, 90vw)",
            display: "grid",
            gap: "6px",
          }}
        >
          <h2>{mediaInfo.title}</h2>

          {typeof mediaInfo.paused === "boolean" && (
            <p>{mediaInfo.paused ? "Paused" : "Playing"}</p>
          )}

          <p>
            {formatTime(mediaInfo.currentTime)} / {formatTime(mediaInfo.duration)}
          </p>

          {Number.isFinite(mediaInfo.volume) && (
            <p>Volume: {Math.floor(mediaInfo.volume * 100)}%</p>
          )}
        </div>
      )}

      <button
        disabled={disabled}
        style={buttonStyle}
        onClick={() => sendCommand("PLAY_PAUSE")}
      >
        PLAY / PAUSE
      </button>

      <button
        disabled={disabled}
        style={buttonStyle}
        onClick={() => sendCommand("VOLUME_UP")}
      >
        VOLUME +
      </button>

      <button
        disabled={disabled}
        style={buttonStyle}
        onClick={() => sendCommand("VOLUME_DOWN")}
      >
        VOLUME -
      </button>

      <button
        disabled={disabled}
        style={buttonStyle}
        onClick={() => sendCommand("SEEK_FORWARD")}
      >
        SEEK +10s
      </button>

      <button
        disabled={disabled}
        style={buttonStyle}
        onClick={() => sendCommand("SEEK_BACKWARD")}
      >
        SEEK -10s
      </button>
    </div>
  );
}

export default App;
