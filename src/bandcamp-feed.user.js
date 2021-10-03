// ==UserScript==
// @name         Bandcamp feed denoiser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove crap from BC feed
// @author       ggorlen
// @run-at       document-start
// @match        https://bandcamp.com/ggorlen/feed
// @icon         https://www.google.com/s2/favicons?domain=bandcamp.com
// @grant        none
// ==/UserScript==

/* TODO
- keep track of what's been listened to already on localhost and
    color differently, or add 'x' to dismiss a story and save on localhost
     .. I guess the sidebar already does this, but the sequence is sort of unclear
*/
(() => {
  const startTime = Date.now();
  (function check() {
    [...document.querySelectorAll("#story-list .story")].forEach(e => {
      if (e.textContent.includes("bought")) {
        e.remove();
      }
    });
    const fans = document.querySelector(".suggested-fans");
    fans && (fans.innerText = "");
    const rel = document.querySelector(".more-releases");
    rel?.offsetParent && rel.click();

    if (Date.now() - startTime < 5000) {
      requestAnimationFrame(check);
    }
  })();

  document.addEventListener("DOMContentLoaded", () => {
    new MutationObserver(mutations => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.textContent?.includes("bought")) {
            node.remove();
          }
        }
      }
    }).observe(document.querySelector("#story-list"), {
      childList: true, subtree: true, attributes: true
    });
  });
})();

