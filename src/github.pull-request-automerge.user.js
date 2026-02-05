// ==UserScript==
// @name         Auto merge on GitHub
// @namespace    http://tampermonkey.net/
// @version      2024-12-19
// @description  merge PR when CI finishes, prefer squash
// @author       ggorlen
// @match        https://github.com/*/*/pull*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

/*
// dumb version
var tid = setInterval(() => {
  const btn = [...document.querySelectorAll("button")].filter(
    e => e.textContent.toLowerCase().includes("squash and merge")
  )[0];

  if (!btn) {
    clearTimeout(tid);
    return;
  }

  if (!btn.disabled) {
    btn.click();

    setTimeout(() => {
      [...document.querySelectorAll("button")]
        .filter(e =>
          e.textContent
            .toLowerCase()
            .includes("confirm squash and merge")
        )[0]
        .click();
    }, 1000);
  }
}, 3000);
*/

setTimeout(() => {
  document.querySelector("#_r_6v_").click();
  setTimeout(() => {
    [...document.querySelectorAll("span")]
      .find(e => e.textContent.includes("from this branch will be combined into one commit in the base branch"))
      .click();
  }, 200);
}, 2_000);

const findMergeButtons = () =>
  [...document.querySelectorAll("button")]
    //.reverse()
    .filter(e =>
      e.textContent.toLowerCase().includes("squash and merge")
    );

(() => {
  setTimeout(() => {
    const container = document.querySelector(".discussion-timeline-actions");
    const btn = document.createElement("button");

    // TODO need to re-add button when switching SPA pages
    // TODO: needs testing, this accidentally bypassed 'bypass review' toggle thingie. check if merge button is disabled?
    //btn.disabled = true;

    container.append(btn);
    btn.textContent = "Auto-merge when possible (don't click this until PR approved!)";
    btn.addEventListener("click", event => {
      btn.disabled = true;
      btn.style.cursor = "default";
      var timeoutId = setInterval(() => {
        var btns = findMergeButtons();

        for (const btn of btns) {
          if (btn) {
            btn.click();
          } else {
            clearTimeout(timeoutId);
           // window.close();
          }
        }
      }, 5_000);
    });
  }, 0);
})();
