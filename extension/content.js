console.log("CONTENT SCRIPT LOADED");

chrome.runtime.onMessage.addListener((message) => {
  console.log("MESSAGE RECEIVED:", message);

  if (message.type === "PLAY_PAUSE") {
    const video = document.querySelector("video");

    if (!video) {
      console.log("NO VIDEO FOUND");
      return;
    }

    if (video.paused) {
      video.play();
      console.log("PLAYING");
    } else {
      video.pause();
      console.log("PAUSED");
    }
  }
});