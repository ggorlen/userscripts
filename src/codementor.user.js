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

(function () {
  "use strict";

  setInterval(() => {
    document.querySelector(".request-filter__refresh-btn").click();
  }, 60000);
})();
