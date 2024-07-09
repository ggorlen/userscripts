// ==UserScript==
// @name         Bandcamp feed denoiser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove crap from BC feed
// @author       ggorlen
// @run-at       document-start
// @match        https://bandcamp.com/ggorlen/feed?*
// @icon         https://www.google.com/s2/favicons?domain=bandcamp.com
// @grant        none
// ==/UserScript==

/* TODO
- keep track of what's been listened to already on localhost and
    color differently, or add 'x' to dismiss a story and save on localhost
     .. I guess the sidebar already does this, but the sequence is sort of unclear
*/
(() => {
  const removeBuyNow = () => {
    [...document.querySelectorAll("li")].forEach(e => {
      if (
        e.textContent.trim().toLowerCase() === "buy now"
      ) {
        e.remove();
      }
    });
  };

  const deny = ["started following you", "bought", "pre-order"];

  const startTime = Date.now();
  (function poll() {
    [...document.querySelectorAll("#story-list .story")].forEach(e => {
      if (deny.some(s => e.textContent.includes(s))) {
        e.remove();
      }
    });
    removeBuyNow();

    const moreReleases = document.querySelector(".more-releases");
    if (moreReleases?.offsetParent) {
      moreReleases.click();
    }

    if (Date.now() - startTime < 5000) {
      requestAnimationFrame(poll);
    }
  })();

  document.addEventListener("DOMContentLoaded", () => {
    new MutationObserver(mutations => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (deny.some(s => node.textContent.includes(s))) {
            node.remove();
          }
        }
      }

      removeBuyNow();
    }).observe(document.querySelector("#story-list"), {
      childList: true, subtree: true, attributes: true
    });
  });

  const style = document.createElement("style");
  document.querySelector("head").appendChild(style);
  style.textContent = `
  .tralbum-art-large {
    max-height: 120px;
    max-width: 120px;
  }

  .tralbum-wrapper-collect-controls {
    margin-bottom: 1em !important;
  }

  .play-button,
  page-footer,
  .less-releases,
  .hear-more,
  .buy-now,
  .collection-item-fav-track,
  .story-footer,
  .collected-by,
  .suggested-fans {
    display: none !important;
  }`;
})();
