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

(function() {
  // TODO maybe a CSS block would be better for the 'aside' and other elements to hide
  const prune = () => {
    document.querySelectorAll("#video-container, aside")
      .forEach(e => e.remove());
  };
  setTimeout(prune, 1000);
  setTimeout(prune, 2000);
  setInterval(prune, 4000);
})();
