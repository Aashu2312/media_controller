(() => {
  if (globalThis.__MEDIA_CONTROLLER_CONTENT_SCRIPT__) {
    console.log(
      "MEDIA CONTROLLER CONTENT SCRIPT ALREADY ACTIVE:",
      window.location.href
    );
    return;
  }

  globalThis.__MEDIA_CONTROLLER_CONTENT_SCRIPT__ = true;

  console.log("CONTENT SCRIPT ACTIVE:", window.location.href);
  console.log("CONTENT SCRIPT LOADED");

  function getMediaElement() {
    return (
      document.querySelector("video") ||
      document.querySelector("audio") ||
      document.querySelector('[data-testid="audio-player"] audio') ||
      document.querySelector("audio[src]")
    );
  }

  function getPlayPauseButton() {
    const selectors = [
      '[data-testid="control-button-playpause"]',
      ".ytp-play-button",
      'button[aria-label="Play"]',
      'button[aria-label="Pause"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);

      if (button) {
        return button;
      }
    }

    return null;
  }

  async function playPause(media) {
    const playPauseButton = getPlayPauseButton();

    if (playPauseButton) {
      playPauseButton.click();
      console.log("PLAY/PAUSE BUTTON CLICKED");
      return true;
    }

    if (!media) {
      return false;
    }

    if (media.paused) {
      await media.play();
      console.log("PLAYING");
    } else {
      media.pause();
      console.log("PAUSED");
    }

    return true;
  }

  function volumeUp(media) {
    if (!media) {
      return false;
    }

    media.volume = Math.min(media.volume + 0.1, 1);
    console.log("VOLUME", media.volume);
    return true;
  }

  function volumeDown(media) {
    if (!media) {
      return false;
    }

    media.volume = Math.max(media.volume - 0.1, 0);
    console.log("VOLUME", media.volume);
    return true;
  }

  function seekForward(media) {
    if (!media) {
      return false;
    }

    media.currentTime = Math.min(
      media.currentTime + 10,
      media.duration || media.currentTime + 10
    );
    return true;
  }

  function seekBackward(media) {
    if (!media) {
      return false;
    }

    media.currentTime = Math.max(media.currentTime - 10, 0);
    return true;
  }

  function toFiniteNumber(value) {
    return Number.isFinite(value) ? value : null;
  }

  function getMediaInfo(media, { ok, command, error = null }) {
    return {
      ok,
      command,
      error,
      title: document.title,
      url: window.location.href,
      currentTime: media ? toFiniteNumber(media.currentTime) : null,
      duration: media ? toFiniteNumber(media.duration) : null,
      paused: media ? media.paused : null,
      volume: media ? toFiniteNumber(media.volume) : null,
    };
  }

  async function handleCommand(message) {
    const command = message?.type;
    let media = getMediaElement();
    let ok = false;
    let error = null;

    console.log("COMMAND:", message);

    try {
      switch (command) {
        case "PLAY_PAUSE":
          ok = await playPause(media);
          break;

        case "VOLUME_UP":
          ok = volumeUp(media);
          break;

        case "VOLUME_DOWN":
          ok = volumeDown(media);
          break;

        case "SEEK_FORWARD":
          ok = seekForward(media);
          break;

        case "SEEK_BACKWARD":
          ok = seekBackward(media);
          break;

        default:
          error = "UNKNOWN_COMMAND";
      }
    } catch (commandError) {
      error = commandError?.message || String(commandError);
    }

    media = getMediaElement();

    if (!ok && !error) {
      error = "NO_MEDIA_ELEMENT_FOUND";
      console.log("NO MEDIA ELEMENT FOUND");
    }

    return getMediaInfo(media, { ok, command, error });
  }

  const initialMedia = getMediaElement();

  console.log("FOUND MEDIA:", initialMedia);
  console.log("URL:", window.location.href);
  console.log("MEDIA:", initialMedia);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleCommand(message)
      .then(sendResponse)
      .catch((error) => {
        sendResponse(
          getMediaInfo(getMediaElement(), {
            ok: false,
            command: message?.type,
            error: error?.message || String(error),
          })
        );
      });

    return true;
  });
})();
