// ==UserScript==
// @name         Bandcamp album userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  block noisy UI on bandcamp album pages
// @author       ggorlen
// @run-at       document-start
// @match        https://*.bandcamp.com/album*
// @icon         https://www.google.com/s2/favicons?domain=bandcamp.com
// @grant        none
// ==/UserScript==

(() => {
  let queries = [
    ".collected-by",
    ".bd",
    ".bclogo",
    ".share-embed",
    "#customHeader",
    () => {
      const navItems = [...document.querySelectorAll("#band-navbar li")];

      if (navItems.length === 0) {
        return true;
      }

      navItems.forEach(e => {
        if (/merch|community|video/.test(e.textContent)) {
          e.remove();
        }
      });
      return false;
    },
  ];
  const startTime = Date.now();
  (function check() {
    queries = queries.filter(q => {
      if (typeof q === "function") {
        return q();
      }

      const el = document.querySelector(q);

      if (el) {
        el.remove();
        return false;
      }

      return true;
    });

    if (queries.length && Date.now() - startTime < 10000) {
      requestAnimationFrame(check);
    }
  })();

  document.addEventListener("DOMContentLoaded", () => {
  });
})();
