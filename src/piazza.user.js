// ==UserScript==
// @name         Piazza - Jonathan Lao "helpful!" click automator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  save time marking Jonathan Lao's comments helpful on Piazza
// @author       ggorlen
// @match        https://piazza.com/class/kjomlag517q3eq?*
// @grant        none
// ==/UserScript==

(function () {
  function throttle(func, timeFrame) {
    var lastTime = 0;
    return function () {
      var now = new Date();

      if (now - lastTime >= timeFrame) {
        func();
        lastTime = now;
      }
    };
  }

  var markHelpful = throttle(function () {
    var xp =`
      //div[contains(text(), "Jonathan Lao")]/../../../..
      //a[contains(@class, do_good_answer) and 
          (normalize-space()="thanks!" or
           normalize-space()="helpful!")]
    `;
    var xpResult = document.evaluate(xp, document);
    var helpfulPosts = [];

    for (var nextEl; 
         nextEl = xpResult.iterateNext();
         helpfulPosts.push(nextEl));

    helpfulPosts.forEach(function (el) {
      el.offsetParent !== null && el.click();
    });
  }, 10000);

  setTimeout(function () {
    new MutationObserver(function (mutations) {
        markHelpful();
      })
      .observe(
        document.documentElement,
        {childList: true, subtree: true, attributes: true}
      )
    ;
  }, 5000);
})();

