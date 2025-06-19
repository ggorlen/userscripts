// ==UserScript==
// @name         Discogs userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Removes some distractions, computes total times for albums, makes it easy to add videos from youtube
// @author       ggorlen
// @match        https://www.discogs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discogs.com
// @run-at       document-start
// @grant        none
// ==/UserScript==


// discogs userscript: one click "add to listened list" button

function handlePaste(e) {
  e.stopPropagation();
  e.preventDefault();
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData('Text');
  addVideosFromYouTube(pastedData.trim().split("\n"));
}

const addVideosFromYouTube = async (titles) => {
  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
  }

  function findInputByLabelText(labelText) {
    return [...document.querySelectorAll('label')].reduce((found, label) => {
      if (found) return found;
      if (label.textContent.trim() === labelText.trim()) {
        return label.htmlFor
          ? document.getElementById(label.htmlFor)
          : label.querySelector('input, textarea, select');
      }
      return null;
    }, null);
  }

  function findButtonByText(text) {
    return [...document.querySelectorAll("button")].find(btn => btn.textContent.trim() === text);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
      Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + 1
            );
      }
    }

    return matrix[b.length][a.length];
  }

  const albumTitle = document.querySelector("[class*=title]").textContent;
  for (const title of titles) {
    const input = findInputByLabelText("YouTube search query:");
    setNativeValue(input, `${albumTitle} ${title} "provided"`);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    findButtonByText("Search")?.click();
    await delay(2000); // TODO actually wait like below:

    //const videos = await new Promise(resolve => {
    //  (function update() {
    //    const videos =
    //      [...document.querySelectorAll("[class*='results'] li")];
    //
    //    if (videos.length) {
    //      return resolve(videos);
    //    }
    //
    //    requestAnimationFrame(update);
    //  })();
    //});
    const videos = [...document.querySelectorAll("[class*='results'] li")];
    let bestMatch = null;
    let minDistance = Infinity;

    for (const video of videos) {
      const link = video.querySelector("a");
      const resultTitle = link.textContent.trim();
      const dist = levenshtein(title.toLowerCase(), resultTitle.toLowerCase());

      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = video;
      }
    }

    if (bestMatch) {
      findButtonByText("Add")?.click();
    }
  }
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

  const total = Object.values(toHMS(sumToSeconds(times)))
    .map(e => String(e).padStart(2, 0))
    .join(":")
    .replace(/^[0:]*/, "");
  const cls = timeEls[0]?.className;

  setTimeout(() => {
    const header = document.querySelector("header[class^='header'] h2");

    if (header.textContent === "Tracklist") {
      header.innerHTML += (times.length ? ` (${times.length})` : "") + ` <button id="copy-tracks">Copy</button>`;
      header.querySelector("#copy-tracks").addEventListener("click", async event => {
        const tracklist = [
          ...document.querySelectorAll('[class^="tracklist"] span[class*="trackTitle"]'),
          ...document.querySelectorAll('[class^="tracklist"] td[class*="trackTitle"]'),
        ].slice(timeEls.length);
        const text = [...tracklist].map(e => e.textContent).join("\n");
        await navigator.clipboard.writeText(text);
      });
    }

    if (times.length) {
      const footer = document.createElement("tfoot");
      footer.innerHTML = `<tr>
        <td></td><td></td><td></td><td class="${cls}"><small>(${total})</small></td>
      </tr>`;
      const tracklist = document.querySelector('[class^="tracklist"]');

      if (!tracklist.querySelector("small")) {
        tracklist.append(footer);
      }
    }
  }, 0);
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
  document.body.addEventListener('paste', handlePaste);
  addTotalDurationToPage();
  new MutationObserver(function(mutations, observer) {
    addTotalDurationToPage();
    observer.disconnect();
  }).observe(
    document.querySelector("#release-tracklist"),
    {childList: true, subtree: true}
  );
});
