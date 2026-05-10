chrome.action.onClicked.addListener((tab) => {
  console.log("EXTENSION CLICKED");

  chrome.tabs.sendMessage(tab.id, {
    type: "PLAY_PAUSE",
  });
});