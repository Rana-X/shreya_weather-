import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker — enables "Install App" button and offline support.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
