// ==UserScript==
// @name         weather.com userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  remove noise
// @author       ggorlen
// @run-at       document-start
// @match        https://weather.com/weather/*
// @match        https://weather.com/forecast/allergy*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=weather.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  document
    .querySelectorAll('script, [as="script"]')
    .forEach(e => e.remove());
  const start = Date.now();

  (function poll() {
    document
      .querySelectorAll('script, [as="script"], .DaypartDetails--DetailsTable--a4Nfo')
      .forEach(e => e.remove());
    const el = document.querySelector("section.card");

    if (el) {
      removeElementsExcept(el);
    }

    if (Date.now() - start < 5_000) {
      requestAnimationFrame(poll);
    }
  })();

  function removeElementsExcept(currentElement) {
    while (currentElement && currentElement !== document.body) {
      const parent = currentElement.parentNode;

      for (let i = parent.children.length - 1; i >= 0; i--) {
        const element = parent.children[i];

        if (currentElement !== element) {
          parent.removeChild(element);
        }
      }

      currentElement = parent;
    }
  }
})();
