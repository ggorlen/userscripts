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

const debounce = (func, timeout=1000) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

const purgeElementsExcept = (selector, ms = 3000) => {
  const start = Date.now();
  (function poll() {
    const el = document.querySelector(selector);

    if (el) {
      removeElementsExcept(el);
    }

    if (Date.now() - start < ms) {
      requestAnimationFrame(poll);
    }
  })();
};

const removeElementsExcept = currentElement => {
  while (currentElement !== document.body) {
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

(function() {
  const selector = "#tablature";
  purgeElementsExcept(selector);
  window.addEventListener("resize", debounce(() => purgeElementsExcept(selector)));
})();
