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
const media = getMediaElement();
console.log("MEDIA:", media);
function playPause(media) {

  const spotifyButton = document.querySelector(
    '[data-testid="control-button-playpause"]'
  );

  if (spotifyButton) {
    spotifyButton.click();
    console.log("SPOTIFY PLAY/PAUSE CLICKED");
    return;
  }

  if (media.paused) {
    media.play();
    console.log("PLAYING");
  } else {
    media.pause();
    console.log("PAUSED");
  }
}
function volumeUp(media){
  media.volume = Math.min(media.volume + 0.1, 1);
  console.log("VOLUME", media.volume);
}

function volumeDown(media){
  media.volume = Math.max(media.volume - 0.1, 0);
  console.log("VOLUME", media.volume);
}


function seekForward(media){
  media.currentTime += 10;
}
function seekBackward(media){
  media.currentTime -= 10;
}

chrome.runtime.onMessage.addListener((message) =>{
  console.log("COMMAND:", message);
  


const media = getMediaElement();
console.log("MEDIA:", media);



if(!media) {
  console.log("NO MEDIA ELEMENT FOUND");
  return;
  
}

switch (message.type){
  case "PLAY_PAUSE":
    playPause(media);
    break;
  case "VOLUME_UP":
    volumeUp(media);
    break;
  case "VOLUME_DOWN":
    volumeDown(media);
    break;
  case "SEEK_FORWARD":
    seekForward(media);
    break;
  case "SEEK_BACKWARD":
    seekBackward(media);
    break;
  default:
    console.log("UNKNOWN COMMAND");
    
}

});