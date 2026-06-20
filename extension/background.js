import { io } from "./node_modules/socket.io-client/dist/socket.io.esm.min.js";
console.log(io);

console.log("BACKGROUND RUNNING");

const SERVER_URL = "http://192.168.0.6:3000";
const CONTROLLABLE_URL = /^https?:\/\//i;
let lastControlledTabId = null;

const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

function queryTabs(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs || []);
    });
  });
}

function canControlTab(tab) {
  return Boolean(tab?.id && tab.url && CONTROLLABLE_URL.test(tab.url));
}

function uniqueTabs(tabs) {
  const seen = new Set();

  return tabs.filter((tab) => {
    if (!canControlTab(tab) || seen.has(tab.id)) {
      return false;
    }

    seen.add(tab.id);
    return true;
  });
}

async function getCandidateTabs() {
  const [allTabs, activeFocusedTabs] = await Promise.all([
    queryTabs({}),
    queryTabs({ active: true, lastFocusedWindow: true }),
  ]);
  const controllableTabs = allTabs.filter(canControlTab);
  const audibleTabs = controllableTabs.filter((tab) => tab.audible);
  const lastControlledTabs = lastControlledTabId
    ? controllableTabs.filter((tab) => tab.id === lastControlledTabId)
    : [];
  const activeTabs = controllableTabs.filter((tab) => tab.active);

  return uniqueTabs([
    ...activeFocusedTabs,
    ...audibleTabs,
    ...lastControlledTabs,
    ...activeTabs,
    ...controllableTabs,
  ]);
}

function sendMessageToTab(tabId, command) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, command, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ error: chrome.runtime.lastError.message });
        return;
      }

      resolve({ response });
    });
  });
}

function injectContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          resolve({ error: chrome.runtime.lastError.message });
          return;
        }

        resolve({});
      }
    );
  });
}

async function sendCommandToTab(tab, command) {
  let result = await sendMessageToTab(tab.id, command);

  if (result.error?.includes("Receiving end does not exist")) {
    console.log("CONTENT SCRIPT MISSING, INJECTING:", tab.url);
    const injected = await injectContentScript(tab.id);

    if (injected.error) {
      return { ...injected, tab };
    }

    result = await sendMessageToTab(tab.id, command);
  }

  return { ...result, tab };
}

async function dispatchCommand(command) {
  const tabs = await getCandidateTabs();

  if (!tabs.length) {
    socket.emit("media-info", {
      ok: false,
      error: "NO_CONTROLLABLE_TAB",
      title: "No controllable browser tab found",
    });
    return;
  }

  let lastFailure = null;

  for (const tab of tabs) {
    console.log("TRYING TAB:", tab.title, tab.url);

    const result = await sendCommandToTab(tab, command);

    if (result.error) {
      console.log("TAB MESSAGE ERROR:", result.error);
      lastFailure = result.error;
      continue;
    }

    if (!result.response) {
      console.log("NO RESPONSE FROM TAB:", tab.url);
      lastFailure = "NO_RESPONSE";
      continue;
    }

    console.log("MEDIA INFO:", result.response);

    if (result.response.ok) {
      lastControlledTabId = tab.id;
      socket.emit("media-info", {
        ...result.response,
        tabTitle: tab.title,
        tabUrl: tab.url,
      });
      return;
    }

    lastFailure = result.response.error || "COMMAND_NOT_HANDLED";
    console.log("TAB COULD NOT HANDLE COMMAND:", lastFailure);
  }

  socket.emit("media-info", {
    ok: false,
    error: lastFailure || "NO_MEDIA_FOUND",
    title: "No controllable media found",
  });
}

socket.on("connect", () => {
  console.log("CONNECTION MADE");
  socket.emit("register-client", { role: "extension" });
});

socket.on("connect_error", (error) => {
  console.log("CONNECTION ERROR:", error);
});

socket.on("disconnect", (reason) => {
  console.log("DISCONNECTED:", reason);
});

socket.on("trigger-media-command", (command) => {
  console.log("COMMAND RECEIVED:", command?.type);

  if (!command?.type) {
    socket.emit("media-info", {
      ok: false,
      error: "INVALID_COMMAND",
      title: "Invalid media command",
    });
    return;
  }

  dispatchCommand(command).catch((error) => {
    console.log("DISPATCH ERROR:", error);
    socket.emit("media-info", {
      ok: false,
      error: error?.message || String(error),
      title: "Media command failed",
    });
  });
});
