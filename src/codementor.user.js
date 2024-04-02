// ==UserScript==
// @name         Codementor open requests
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  auto-refresh codementor feed
// @author       ggorlen
// @match        https://www.codementor.io/m/dashboard/open-requests*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codementor.io
// @grant        none
// ==/UserScript==

const pollUntilExists = (sel, cb, stopAfter = 10_000, pollMs = 200) => {
  const interval = setInterval(() => {
    const els = document.querySelectorAll(sel);

    if (els.length) {
      clearInterval(interval);
      cb(els);
    }
  }, pollMs);

  setTimeout(() => {
    clearInterval(interval);
    console.warn(`Unable to find selector ${sel} after ${stopAfter}ms`);
  }, stopAfter);
};

(function () {
  "use strict";

  // get new listings every 60 seconds
  setInterval(() => {
    document.querySelector(".request-filter__refresh-btn")?.click();
  }, 60_000);

  // remove the ARC advertisement banner
  pollUntilExists(
    '[data-track="cm-openRequest-arcBanner"]',
    els => els.forEach(el => el.remove())
  );

  // remove filtering by my interests (I want to see all requests)
  pollUntilExists(
    ".request-filter__active-filter",
    els => els[0].click()
  );
})();
