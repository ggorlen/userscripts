// ==UserScript==
// @name         Udacity Skipper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  click through the 5-second delay between udacity videos
// @author       You
// @match        https://classroom.udacity.com/courses/*
// @grant        none
// ==/UserScript==

(function () {
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      for (var j = 0; j < mutations[i].addedNodes.length; j++) {
        try {
          if (mutations[i].addedNodes[j].className.includes("index--auto-advance-overlay--BKc5y")) {
            document.querySelector("._auto-advance-overlay--button--3yFIl").click();
          }
        }
        catch (err) {}
      }
    }
  }).observe(document.documentElement, {childList: true, subtree: true, attributes: true});
})();

