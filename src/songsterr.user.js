// ==UserScript==
// @name         Songsterr
// @namespace    http://tampermonkey.net/
// @version      2024-06-23
// @description  Remove crap from songsterr tablature
// @author       ggorlen
// @match        https://www.songsterr.com/a/wsa/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=songsterr.com
// @grant        none
// ==/UserScript==

const removeElementsExcept = currentElement => {
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
};

(() => {
  new MutationObserver(mutations => {
    removeElementsExcept(document.querySelector("#tablature"));
  }).observe(document.body, {
    childList: true, subtree: true, attributes: true
  });
})();
