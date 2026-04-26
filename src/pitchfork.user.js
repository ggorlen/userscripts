// ==UserScript==
// @name         Pitchfork userscript
// @namespace    http://tampermonkey.net/
// @version      2024-08-17
// @description  Remove annoying videos from Pitchfork
// @author       ggorlen
// @match        https://pitchfork.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pitchfork.com
// @grant        none
// ==/UserScript==

// TODO maybe a CSS block would be better for the 'aside' and other elements to hide

(function() {
  const freezeGif = (img) => {
    if (img.dataset.frozen) {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = img.width + "px";
    canvas.style.height = img.height + "px";
    canvas.style.objectFit = getComputedStyle(img).objectFit;

    ctx.drawImage(img, 0, 0, width, height);
    canvas.className = img.className;
    img.replaceWith(canvas);

    canvas.dataset.frozen = "true";
  };

  const prune = () => {
    document.querySelectorAll("#video-container, aside").forEach(e => e.remove());
    document.querySelectorAll("video").forEach(e => e.remove());

    document.querySelectorAll("img[src*='.gif']").forEach(img => {
      if (img.complete) {
        freezeGif(img);
      } else {
        img.addEventListener("load", () => freezeGif(img));
      }
    });
  };

  setTimeout(prune, 1000);
  setTimeout(prune, 2000);
  setInterval(prune, 4000);
})();

