# 🎵 Universal Media Controller Chrome Extension

A Chrome extension that allows users to control media playback across websites directly from the browser popup.

The extension detects active media elements (`video` and `audio`) on supported websites and provides quick playback controls like play, pause, skip, and volume adjustment without needing to switch tabs.

---

## 🚀 Features

- ▶️ Play / Pause media
- ⏭️ Skip forward
- ⏮️ Skip backward
- 🔊 Volume controls
- 🌐 Works across multiple websites
- ⚡ Lightweight and responsive
- 🧩 Built using Chrome Extension Manifest V3

---

## 🛠️ Tech Stack

- JavaScript (ES6)
- HTML5
- CSS3
- Chrome Extensions API
- Manifest V3

---

## 📂 Project Structure

```bash
media-controller/
│── manifest.json
│── popup.html
│── popup.js
│── popup.css
│── content.js
│── background.js
│── icons/
```

---

## ⚙️ How It Works

The extension injects a content script into webpages to detect media elements such as:

```html
<video>
<audio>
```

When a user interacts with the popup UI:
1. A message is sent from the popup script
2. The content script receives the command
3. The active media element is controlled using JavaScript media APIs

Example:

```javascript
video.play();
video.pause();
video.currentTime += 10;
```

Because apparently opening the actual media tab was too much physical labor for modern civilization.

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/media-controller.git
```

### 2. Open Chrome Extensions

Go to:

```bash
chrome://extensions/
```

### 3. Enable Developer Mode

Turn on **Developer Mode** from the top-right corner.

### 4. Load the extension

Click **Load unpacked** and select the project folder.

---

## 📸 Screenshots

_Add screenshots here after finalizing the UI._

Suggested screenshots:
- Extension popup UI
- Media controls working on YouTube
- Playback controls on Spotify Web

---

## 🧠 What I Learned

- Chrome Extension architecture
- Manifest V3 workflow
- Content scripts and message passing
- DOM media element handling
- Browser permissions and security restrictions
- Debugging cross-site media behavior

---

## 🔮 Future Improvements

- Keyboard shortcuts
- Media session API integration
- Better Spotify Web support
- Track information display
- Dark mode UI
- Global media hotkeys
- Playlist controls

---

## 🤝 Contributing

Contributions are welcome.

If you find bugs or want to improve the extension, feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.
