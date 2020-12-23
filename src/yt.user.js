// ==UserScript==
// @name         YT userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make YT less suck
// @author       You
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const actions = [
    {
      // disable autoplay if enabled
      selector: () => document.querySelector('[aria-label="Autoplay"]'),
      onFound: el =>
        el.getAttribute("aria-pressed") === "true" && el.click()
    },
    {
      // shut down the sidebar
      selector: () => document.querySelector("#related"),
      onFound: el => (el.style.display = "none")
    },
    {
      // shut down the comments section
      selector: () => document.querySelector("#comments"),
      onFound: el => (el.style.display = "none")
    },
    {
      // turn off pointless buttons
      selector: () => document.querySelectorAll("#buttons > *"),
      onFound: el => [...el].slice(0, -1).forEach(el => (el.style.display = "none"))
    },
    {
      // hide yt logo
      selector: () => document.querySelector("#logo"),
      onFound: el => (el.style.display = "none")
    },/*
    {
      // expand 'show more'
      selector: () => {
        const el = document.querySelector(".more-button");
        return (el && el.innerText.toLowerCase().includes("show more")) ? el : null;
      },
      onFound: el =>
        el.parentElement.getAttribute("aria-expanded") === "false" &&
        el.click()
    },*/
  ];

  new MutationObserver(mutations => {
    for (let i = actions.length - 1; i >= 0; i--) {
      const el = actions[i].selector();

      if (el) {
        actions[i].onFound(el);
//        actions.splice(i, 1);
      }
    }
  })
  .observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });

  const style = document.createElement("style");
  document.querySelector("head").appendChild(style);
  style.type = "text/css";
  style.innerHTML = `

* {
  font-family: monospace;
}

`;
})();

