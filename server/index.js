const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json({ ok: true, service: "media-controller-server" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const clients = new Map();

function getClientCounts() {
  let extensionCount = 0;
  let phoneCount = 0;

  for (const client of clients.values()) {
    if (client.role === "extension") {
      extensionCount += 1;
    }

    if (client.role === "phone") {
      phoneCount += 1;
    }
  }

  return { extensionCount, phoneCount };
}

function emitServerStatus() {
  io.emit("server-status", getClientCounts());
}

app.get("/clients", (req, res) => {
  res.json({ ok: true, ...getClientCounts() });
});

io.on("connection", (socket) => {
  console.log("DEVICE CONNECTED:", socket.id);
  clients.set(socket.id, { role: "unknown" });

  socket.on("register-client", ({ role }) => {
    if (role !== "extension" && role !== "phone") {
      return;
    }

    socket.join(role === "extension" ? "extensions" : "phones");
    clients.set(socket.id, { role });
    console.log("CLIENT REGISTERED:", socket.id, role);
    emitServerStatus();
  });

  socket.on("media-command", (command) => {
    console.log("COMMAND:", command);

    if (getClientCounts().extensionCount === 0) {
      socket.emit("media-update", {
        ok: false,
        command: command?.type,
        error: "NO_EXTENSION_CONNECTED",
        title: "Chrome extension is not connected",
      });
      return;
    }

    io.to("extensions").emit("trigger-media-command", command);
  });

  socket.on("media-info", (data) => {
    io.to("phones").emit("media-update", data);
  });

  socket.on("disconnect", () => {
    clients.delete(socket.id);
    console.log("DEVICE DISCONNECTED");
    emitServerStatus();
  });

  emitServerStatus();
});

const PORT = 3000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. The media controller server is probably already running.`
    );
    process.exit(1);
  }

  throw error;
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT 3000");
});
