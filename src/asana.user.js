// ==UserScript==
// @name         Asana Favicon Override (No White Dot)
// @namespace    http://tampermonkey.net/
// @version      2025-05-14
// @description  Completely block Asana from drawing notification dots on the favicon by forcing a static one and disabling their update logic.
// @author       You
// @match        https://app.asana.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const fixedFaviconUrl = 'https://www.google.com/s2/favicons?sz=64&domain=asana.com';

  // Override common methods Asana might use to update the favicon
  const blockFaviconUpdate = () => {
    // Block known favicon libraries (e.g., tinycon, favico.js)
    if (window.Tinycon) window.Tinycon.setBubble = () => {};
    if (window.Favico) window.Favico = function () { return { badge: () => {}, reset: () => {} }; };

    // Override document.title setter if favicon is updated through it
    try {
      Object.defineProperty(document, 'title', {
        set: function () {}, // ignore attempts to change it
        get: function () { return 'Asana'; }
      });
    } catch (e) {
      // May fail silently — not critical
    }
  };

  // Force favicon to a static one
  const forceFavicon = () => {
    // Remove all existing favicons
    const links = document.querySelectorAll("link[rel~='icon']");
    for (const link of links) {
      link.remove();
    }

    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.type = 'image/png';
    newFavicon.href = fixedFaviconUrl;
    document.head.appendChild(newFavicon);
  };

  // Apply immediately and periodically to fight back against Asana’s updates
  const applyOverride = () => {
    blockFaviconUpdate();
    forceFavicon();
  };

  setInterval(applyOverride, 1000); // repeat every second
})();
