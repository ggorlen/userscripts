// ==UserScript==
// @name         github cleanup
// @namespace    http://tampermonkey.net/
// @version      2025-04-20
// @description  remove some crap on the GH homepage
// @author       ggorlen
// @match        https://github.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
  document.querySelector(".feed-right-sidebar").remove();
  document.querySelector(".copilotPreview__suggestions").remove();
})();
