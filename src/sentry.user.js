// ==UserScript==
// @name         sentry cookie show-er
// @namespace    http://tampermonkey.net/
// @version      2025-07-27
// @description  shows me when my sentry.io creds will expire
// @author       You
// @match        https://sentry.io/settings/account/security/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sentry.io
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_10_MINUTES = 1000 * 60 * 10;
  const WARNING_DAYS_THRESHOLD = 3;
  const DAYS = 14;

  function getRemainingDays(targetTimestamp) {
    const now = Date.now();
    const diff = targetTimestamp - now;
    return Math.max(0, Math.ceil(diff / MS_IN_DAY));
  }

  function getStoredDeadline() {
    const stored = localStorage.getItem("twoWeekDeadline");
    return stored ? parseInt(stored, 10) : null;
  }

  function setNewDeadline() {
    const deadline = Date.now() + DAYS * MS_IN_DAY;
    localStorage.setItem("twoWeekDeadline", deadline.toString());
    return deadline;
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function updateDisplay(deadline) {
    const daysLeft = getRemainingDays(deadline);
    const deadlineStr = formatDate(deadline);
    daysText.textContent = `Days until session expires: ${daysLeft} (${deadlineStr})`;
    el.style.backgroundColor = daysLeft <= WARNING_DAYS_THRESHOLD ? "red" : "black";
  }

  // UI Elements
  const el = document.createElement("div");
  el.style.padding = "0.3em";
  el.style.color = "white";
  el.style.fontFamily = "sans-serif";

  const daysText = document.createElement("span");

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.style.marginLeft = "1em";
  resetButton.style.padding = "0.3em 0.6em";
  resetButton.style.cursor = "pointer";
  resetButton.style.fontSize = "1em";

  resetButton.addEventListener("click", () => {
    if (confirm("Reset the 2-week countdown?")) {
      const newDeadline = setNewDeadline();
      updateDisplay(newDeadline);
    }
  });

  el.appendChild(daysText);
  el.appendChild(resetButton);
  document.body.prepend(el);

  // Init
  let deadline = getStoredDeadline() || setNewDeadline();
  updateDisplay(deadline);

  // Update every 10 minutes
  setInterval(() => {
    deadline = getStoredDeadline();
    updateDisplay(deadline);
  }, MS_IN_10_MINUTES);
})();
