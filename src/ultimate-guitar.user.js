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
  document.body.style.color = "white";
  document.body.style.padding = "3em";
  document.body.innerHTML = code.outerHTML;
})();

const end = performance.now() + 5000;
(function poll() {
  [...document.querySelectorAll("head script, head style, iframe, head link")]
    .forEach(e => e.remove());

  if (performance.now() < end) {
    requestAnimationFrame(poll);
  }
})();

const observer = new MutationObserver((mutationList, observer) => {
  document.querySelector("[style*='z-index: 10000']")?.remove();
});
observer.observe(document.body, {attributes: true, childList: true, subtree: true});
