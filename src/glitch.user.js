// ==UserScript==
// @name         Read Wikipedia when waiting for Glitch apps to start
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  More fun than doodling in one color
// @author       ggorlen
// @match        http://*.glitch.me/*
// @match        https://*.glitch.me/*
// @grant        none
// ==/UserScript==

(() => {
  const placeholderURL = "https://en.wikipedia.org/wiki/Special:Random";
  
  const debounce = (fn, delay=200) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const noteEl = document.querySelector(".note");

  if (noteEl && noteEl.textContent.includes("keep Glitch fast")) {
    const mainEl = document.querySelector("main");
    const messageEl = document.querySelector("#message");
    const contentEl = document.querySelector(".content");
    const loaderEl = document.querySelector("#loader");
    mainEl && (mainEl.style.padding = 0);
    contentEl && (contentEl.style.margin = 0);
    messageEl && (messageEl.style.cssText = `
      background: #333;
      color: #fff;
      margin: 0;
      padding: 0.5em;
      box-shadow: 1px 1px 1px #222;
    `);
    loaderEl && (loaderEl.style.opacity = 0);
    document.body.style.margin = 0;
    noteEl.textContent = "";
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    const canvasEl = document.querySelector("canvas");
    frame.src = placeholderURL;
    frame.width = document.documentElement.clientWidth;
    frame.height = document.documentElement.clientHeight;
    canvasEl.remove();
    window.addEventListener("resize", debounce(e => {
      frame.width = document.documentElement.clientWidth;
      frame.height = document.documentElement.clientHeight;
    }));
  }
})();

