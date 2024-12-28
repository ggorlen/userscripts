// ==UserScript==
// @name         Comulate 'prod' warning
// @namespace    http://tampermonkey.net/
// @version      2024-11-08
// @description  Show a PROD warning in comulate prod
// @author       ggorlen
// @match        https://*.comulate.com/*
// @icon         https://www.google.com/s2/favicons?domain=comulate.com
// @grant        none
// ==/UserScript==

(function () {
  const prodLabel = document.createElement("div");
  prodLabel.innerText = "Production";
  Object.assign(prodLabel.style, {
    position: "fixed",
    bottom: "10px",
    right: "20px",
    backgroundColor: "red",
    color: "white",
    padding: "5px 10px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "5px",
    zIndex: "10000000",
  });
  document.body.appendChild(prodLabel);
  const prodBanner = document.createElement("div");
  Object.assign(prodBanner.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "5px",
    backgroundColor: "red",
    zIndex: "10000000",
  });
  document.body.appendChild(prodBanner);
})();
