// ==UserScript==
// @name         Bandcamp Collection Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make bandcamp collection compact
// @author       ggorlen
// @match        https://bandcamp.com/ggorlen
// @match        https://bandcamp.com/ggorlen/*
// @grant        none
// ==/UserScript==

/*
TODO
- make collection sortable
*/

(function() {
  const style = document.createElement("style");
  document.querySelector("head").appendChild(style);
  style.type = "text/css";
  style.innerHTML = `

#fan-banner {
  display: none;
}

.top {
  display: none;
}

.collected-by-header {
  display: none !important;
}

.collection-grid > li {
  margin: 0;
  margin-left: 1em;
}

li.collection-item-container > * {
  margin: 4px;
}

.collection-item-gallery-container {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}
.collection-item-artist {
  font-weight: bold;
}
.collection-item-title {
  font-weight: normal;
}
.collection-item-container {
  display: block !important;
  width: 500px !important;
  min-height: auto !important;
}
.collection-item-actions {
  visibility: visible;
}
.collection-item-art-container {
  width: auto !important;
  outline: 0 !important;
  border: 0 !important;
  display: inline-block !important;
}
.collection-item-details-container {
  padding: 5px;
}
.collection-item-art {
  display: none;
}
.collection-item-fav-track {
  display: none;
}

.knockout-container {
  display: none !important;
}

.hide-item {
  visibility: visible;
}

.just-hint {
  display: none !important;
}

.item-link * {
  display: inline;
}
.item_link_play {
  width: 17px !important;
  height: 17px !important;
  border-radius: 5px;
  top: 0 !important;
  left: 0 !important;
  display: block !important;
  position: relative !important;
  background: #333;
  padding: 0.3em;
  margin-right: 1em;
}
.item_link_play_bkgd {
  opacity: 1 !important;
  display: none !important;
  top: 0 !important;
  position: relative !important;
}
.item_link_play_widget {
  opacity: 1 !important;
  display: block !important;
  position: inherit !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0;
  right: 0;
}

.drag-thumb {
  display: block;
  position: relative;
  opacity: 1 !important;
}
.drag-thumb .bc-ui {
  display: block !important;
  opacity: 1 !important;
}

.package-details {
  display: none;
}

.track_play_auxiliary {
  width: auto !important;
  outline: 0 !important;
  border: 0 !important;
}

  `;

  document.querySelector(".show-more").click();

})();
