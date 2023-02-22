// ==UserScript==
// @name         Discogs userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Computes total times for albums, and maybe other things in the future
// @author       ggorlen
// @match        https://www.discogs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discogs.com
// @grant        none
// ==/UserScript==

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

  const timeEls = [...document.querySelectorAll('#release-tracklist [class^="duration"]')];
  const times = timeEls.map(e => e.textContent);

  if (times.length) {
    const total = Object.values(toHMS(sumToSeconds(times)))
      .map(e => String(e).padStart(2, 0))
      .join(":")
      .replace(/^[0:]*/, "");
    const cls = timeEls[0].className;

    if (!/^[0:]*$/.test(total)) {
      const footer = document.createElement("tfoot");
      footer.innerHTML = `<tr>
        <td></td><td></td><td></td><td class="${cls}">Total:&nbsp;${total}</td>
      </tr>`;
      document.querySelector('[class^="tracklist"]').append(footer);
    }
  }
};
addTotalDurationToPage();
