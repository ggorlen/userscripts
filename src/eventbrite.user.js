// ==UserScript==
// @name     try to find stern grove secret ticket releases on eventbrite
// @namespace  http://tampermonkey.net/
// @version    2024-07-11
// @description  try to find stern grove secret ticket releases on eventbrite
// @author     You
// @match    https://www.eventbrite.com/e/stern-grove-festival-featuring-herbie-hancock-with-the-sfjazz-collective-tickets-902766156877
// @icon     https://www.google.com/s2/favicons?sz=64&domain=eventbrite.com
// @grant    none
// ==/UserScript==

// Note for Stern Grove posterity that secret releases happened shortly after a standard release,
// something like 8:20 and 9:00 after an 8:00 release.
// The rest were pretty random, a few releases happened around 8 or 9 AM on a weekday, a few the weekend of the show in mornings or evenings.
// Also note that trying to buy 2 tickets seemed to fail more readily than buying 1 ticket

(() => {
  const testId = 'conversion-bar';
  const storageKey = 'conversionBarContent';
  const checkInterval = (Math.random() * 5 + 2) * 60 * 1000; // 5-7 minutes

  function getConversionBarContent() {
    const element = document.querySelector(`[data-testid="${testId}"]`);
    return element ? element.innerHTML.replace(
      /id="eventbrite-widget-modal-trigger-[^"]+"/,
      'id="eventbrite-widget-modal-trigger-"'
    ) : null;
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    setInterval(() => {
      speechSynthesis.speak(utterance);
    }, 10_000);
  }

  function monitorConversionBar() {
    const currentContent = getConversionBarContent();
    if (currentContent === null) {
      speak(`Element with data-testid="${testId}" not found.`);
      return;
    }

    const previousContent = localStorage.getItem(storageKey);

    if (!previousContent) {
      // First time setup: store the current content
      localStorage.setItem(storageKey, currentContent);
    } else if (currentContent !== previousContent) {
      // Content has changed: notify the user
      console.log("current:", currentContent);
      console.log("previous:", previousContent);
      localStorage.setItem(storageKey, currentContent);
      speak('Button content has changed on the eventbrite page -- check it out to see if tickets are available');
    } else {
      // Content hasn't changed: refresh the page after 5 minutes
      setTimeout(() => {
        location.reload();
      }, checkInterval);
    }
  }

  setTimeout(() => {
    monitorConversionBar();
  }, 5000);
})();
