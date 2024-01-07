// ==UserScript==
// @name         Discogs userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Computes total times for albums, adds MPV quick copy link, and maybe other things in the future
// @author       ggorlen
// @match        https://www.discogs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discogs.com
// @run-at       document-start
// @grant        none
// ==/UserScript==

const addMPVCopyLink = () => {
  const ytUrls = [
    ...document
      .querySelector("#dsdata")
      .textContent.matchAll(/"youtubeId"\s*:\s*"([^"]+)"/g),
  ].map(e => `https://www.youtube.com/watch?v=${e[1]}`);
  const videos = document.createElement("div");
  videos.style.fontFamily = "monospace";
  videos.style.fontSize = "9px";
  videos.innerHTML = "<button>Copy MPV</button>";
  document.querySelector("#release-videos")
    .insertAdjacentElement("beforebegin", videos);
  videos.querySelector("button").addEventListener("click", e => {
    navigator.clipboard.writeText(
       `mpv -no-vid ${ytUrls.join(" ")}`
    );
  });
};

const addTotalDurationToPage = () => {
  const sumToSeconds = times => {
    return times.reduce((a, e) => {
      const parts = e.trim().split(":").map(Number);
      parts.forEach((e, i) => {
        if (i < parts.length - 1) {
          parts[i+1] += e * 60;
        }
      });
      return parts.pop() + a;
    }, 0);
  };

  const toHMS = time => {
    const labels = ["h", "m", "s"];
    return Object.fromEntries(
      labels.map((e, i) => [
        e,
        ~~(time / 60 ** (labels.length - i - 1)) % 60,
      ])
    );
  };

  const timeEls = [...document.querySelectorAll(
    `#release-tracklist [data-track-position] [class^="duration"],
     #release-tracklist [class^="index"] [class^="duration"],
     #release-tracklist [class^="subtrack"] [class^="duration"]`
  )];
  const times = timeEls
    .map(e => e.textContent.replace(/[()]/g, ""))
    .filter(Boolean);

  if (times.length) {
    const total = Object.values(toHMS(sumToSeconds(times)))
      .map(e => String(e).padStart(2, 0))
      .join(":")
      .replace(/^[0:]*/, "");
    const cls = timeEls[0].className;

    if (!/^[0:]*$/.test(total)) {
      const footer = document.createElement("tfoot");
      footer.innerHTML = `<tr>
        <td></td><td></td><td></td><td class="${cls}"><small>(${total})</small></td>
      </tr>`;
      document.querySelector('[class^="tracklist"]').append(footer);
    }
  }
};

const addStyleSheet = () => {
  const css = `<style>
footer,
.side_3-xID > .wrapper_cGBtH > .buttons_2jlYL,
.side_3-xID .report_3dOkc,
.wrapper_3ECKE,
.ratings_1pAt8,
#master-release-marketplace,
#release-contributors,
#release-marketplace,
.categoriesItem_S45kC,
a[href="/sell/cart"],
a[href="/lists"],
#release-actions,
#audio,
#master-actions {
  display: none !important;
}
</style>`;
  (document.head || document.documentElement).insertAdjacentHTML(
    "beforeend", css
  );
};
addStyleSheet();

document.addEventListener("DOMContentLoaded", () => {
  addMPVCopyLink();
  addTotalDurationToPage();
  new MutationObserver(function(mutations, observer) {
    addTotalDurationToPage();
    observer.disconnect();
  }).observe(
    document.querySelector("#release-tracklist"),
    {childList: true, subtree: true}
  );
});
