// ==UserScript==
// @name         ultimate guitar
// @namespace    http://tampermonkey.net/
// @version      2026-06-26
// @description  just show me the tab
// @author       ggorlen
// @match        https://tabs.ultimate-guitar.com/tab/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ultimate-guitar.com
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function poll() {
  const code = document.querySelector("code");

  if (!code) {
    requestAnimationFrame(poll);
    return;
  }

  code.style.display = "flex";
  code.style.justifyContent = "center";
  code.style.alignItems = "center";
  const pre = code.querySelector("pre");
  pre.style.fontSize = "14pt";
  pre.style.lineHeight = "1.2";
  document.body.style.padding = "3em";
  document.body.innerHTML = code.outerHTML;
})();
