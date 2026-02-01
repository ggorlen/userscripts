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

// Bugs:
// - userscript should ignore parenthesis when counting tracks:
//   - https://www.discogs.com/master/420260-Bach-Gubaidulina-Anne-Sophie-Mutter-Violin-Concertos-In-Tempus-Praesens
//   - https://www.discogs.com/master/261660-Spocks-Beard-V
//   - https://www.discogs.com/master/10291-Ulver-Perdition-City-Music-To-An-Interior-Film
//   - https://www.discogs.com/master/3755-Nine-Inch-Nails-Further-Down-The-Spiral
// - https://www.discogs.com/release/1081405-Lou-Reed-Street-Hassle
// - https://www.discogs.com/release/35023970-Fleshwater-2000-In-Search-Of-The-Endless-Sky
// - https://www.discogs.com/release/13858581-Mitchell-W-Feldstein-Pretty-Boss
//
// TODO:
// - 1-click list removal
// - auto-remove dead videos
// - speed up adding tracklist count
// - add support for trying to find a full album first, then fallback on provided
// - autoplay, requires changing browser flag

const pasteFlag = "::PASTEFLAG::";
const handlePaste = e => {
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData("Text");

  if (!pastedData.startsWith(pasteFlag)) {
    return;
  }

  e.stopPropagation();
  e.preventDefault();
  addVideosFromYouTube(
    pastedData.slice(pasteFlag.length).trim().split("\n")
  );
};

const findButtonByText = text =>
  [...document.querySelectorAll("button")].find(
    btn => btn.textContent.trim() === text
  );

const addVideosFromYouTube = async titles => {
  const setNativeValue = (element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      element,
      "value"
    )?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
  };

  const findInputByLabelText = labelText => {
    return [...document.querySelectorAll("label")].reduce(
      (found, label) => {
        if (found) return found;
        if (label.textContent.trim() === labelText.trim()) {
          return label.htmlFor
            ? document.getElementById(label.htmlFor)
            : label.querySelector("input, textarea, select");
        }
        return null;
      },
      null
    );
  };

  const levenshtein = (a, b) => {
    const matrix = Array.from({length: b.length + 1}, (_, i) =>
      Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + 1
              );
      }
    }

    return matrix[b.length][a.length];
  };

  const getVideos = () => [
    ...document.querySelectorAll("[class*='results'] li"),
  ];

  const albumTitle =
    document.querySelector("[class*=title]").textContent;

  for (const title of titles) {
    const input = findInputByLabelText("YouTube search query:");
    setNativeValue(
      input,
      `${albumTitle.replace(/\(\d+\)/, "")} ${title} "provided"`
    );
    input.dispatchEvent(new Event("input", {bubbles: true}));
    const videosBeforeSearching = getVideos().map(
      e => e.textContent
    );
    findButtonByText("Search").click();
    await new Promise(r => setTimeout(r, 500));
    await new Promise(resolve => {
      let iterations = 100;
      const intervalId = setInterval(() => {
        const videos = getVideos().map(e => e.textContent);

        if (videos.length !== videosBeforeSearching.length) {
          return resolve();
        }

        for (const [i, e] of videos.entries()) {
          if (e !== videosBeforeSearching[i]) {
            clearInterval(intervalId);
            return resolve();
          }
        }

        if (--iterations < 0) {
          clearInterval(intervalId);
          return resolve();
        }
      }, 20);
    });
    const videos = getVideos();
    let bestMatch = null;
    let minDistance = Infinity;

    for (const video of videos) {
      const link = video.querySelector("a");
      const resultTitle = link.textContent.trim();
      const dist = levenshtein(
        title.toLowerCase(),
        resultTitle.toLowerCase()
      );

      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = video;
      }
    }

    if (bestMatch) {
      document
        .querySelector(".results_fzr77 .button_PgYDF")
        .click();
    }
  }
};

const addTotalDurationToPage = () => {
  const sumToSeconds = times => {
    return times.reduce((a, e) => {
      const parts = e.trim().split(":").map(Number);
      parts.forEach((e, i) => {
        if (i < parts.length - 1) {
          parts[i + 1] += e * 60;
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

  const timeEls = [
    ...document.querySelectorAll(
      `#release-tracklist [data-track-position] [class^="duration"],
     #release-tracklist [class^="index"] [class^="duration"],
     #release-tracklist [class^="subtrack"] [class^="duration"]`
    ),
  ];
  const times = timeEls
    .map(e => e.textContent.replace(/[()]/g, ""))
    .filter(Boolean);

  const total = Object.values(toHMS(sumToSeconds(times)))
    .map(e => String(e).padStart(2, 0))
    .join(":")
    .replace(/^[0:]*/, "");
  const cls = timeEls[0]?.className;

  setTimeout(() => {
    const header = document.querySelector(
      "header[class^='header'] h2"
    );

    if (header?.textContent === "Tracklist") {
      const trackCount =
        times.length ||
        document.querySelectorAll("[data-track-position]")
          .length;
      header.innerHTML += ` (${trackCount}) <button id="copy-tracks">Copy</button>`;
      header
        .querySelector("#copy-tracks")
        .addEventListener("click", async event => {
          const tracklist = [
            ...document.querySelectorAll(
              '[class^="tracklist"] span[class*="trackTitle"]'
            ),
            ...document.querySelectorAll(
              '[class^="tracklist"] td[class*="trackTitle"]'
            ),
          ].slice(
            0,
            timeEls.length ||
              document.querySelectorAll("[data-track-position]")
                .length
          );
          const text = [...tracklist]
            .map(e => e.textContent)
            .join("\n");
          await navigator.clipboard.writeText(pasteFlag + text);
        });
    }

    if (times.length) {
      const footer = document.createElement("tfoot");
      footer.innerHTML = `<tr>
        <td></td><td></td><td></td><td class="${cls}"><small>(${total})</small></td>
      </tr>`;
      const tracklist = document.querySelector(
        '[class^="tracklist"]'
      );

      if (!tracklist.querySelector("small")) {
        tracklist.append(footer);
      }
    }
  }, 500);
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
#shopping-box-host,
#master-actions {
  display: none !important;
}
</style>`;
  (document.head || document.documentElement).insertAdjacentHTML(
    "beforeend",
    css
  );
};

const addToListened = async () => {
  try {
    const match = location.pathname.match(
      /\/(?:release|master)\/(\d+)/
    );
    if (!match) {
      alert("Could not find release or master ID in URL");
      return;
    }

    const releaseId = parseInt(match[1], 10);
    const response = await fetch(
      "https://www.discogs.com/service/catalog/api/graphql",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "apollographql-client-name": "release-page-client",
        },
        body: JSON.stringify({
          operationName: "AddItemToExistingList",
          variables: {
            input: {
              itemDiscogsId: releaseId,
              listDiscogsId: 633552, // my "listened" list
              itemType: location.pathname.includes("/release/")
                ? "RELEASE"
                : "MASTER_RELEASE",
              comment: "",
            },
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "394903702c8c40d06d0caf83c58a5f876097205cf85be97eeb2b39646455aaa2",
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && !data.errors) {
      console.log(
        `Added release ${releaseId} to 'listened' list`
      );
    } else {
      console.error("Discogs API error:", data);
      alert("Failed to add — check console for details");
    }

    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Something went wrong — see console");
  }
};

const addAddToListButton = () => {
  let iterations = 100;
  (function poll() {
    const addToListButton = findButtonByText("Add to List");
    const addToListenedButton = document.createElement("button");
    addToListenedButton.textContent = "Mark Listened";
    addToListenedButton.style.marginLeft = "0.5em";
    addToListenedButton.addEventListener("click", async () => {
      if (await addToListened()) {
        addToListenedButton.textContent = "Mark Listened ✅";
        addToListenedButton.disabled = true;
      }
    });
    addToListButton?.parentNode.append(addToListenedButton);

    if (!addToListButton && --iterations >= 0) {
      requestAnimationFrame(poll);
    }
  })();
};

addStyleSheet();
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("paste", handlePaste);
  addAddToListButton();
  setTimeout(addTotalDurationToPage, 500);
});
