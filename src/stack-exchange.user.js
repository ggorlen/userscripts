// ==UserScript==
// @name         Stack Overflow Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Offers one-click votes and hides noisy features
// @author       ggorlen
// @match        https://stackoverflow.com/questions*
// @match        https://stackoverflow.com/review*
// @match        https://meta.stackoverflow.com/questions*
// @match        https://askubuntu.com/questions*
// @match        https://superuser.com/questions*
// @include      /https://.*?\.stackexchange\.com/questions*
// @grant        none
// ==/UserScript==

// TODO
// - https://meta.stackoverflow.com/questions/410618/how-can-we-find-last-seen-and-profile-views-info-on-the-profile-page-now-tha
// - one-click links to add canonical comments, maybe from dropdown
// - script to auto-cast delete votes on posts I've closed
// - show OP's acceptance percentage and other stats on their question page
// - "show 1 comment" or "1 new answer" should be auto-clicked with a MutationObserver
// - make it work on review queues
// - add (1) for votes other people have cast for a particular reason (might be more trouble than its worth)
// - auto-click to accept reopen popups and other prompts.
// - don't show retract link if post is closed.
// - make sure downvotes don't toggle on shift-clicks
// - VTC with custom reason
// - voting then retracting shouldn't re-show links if possible.
// - when someone else edits the question, prevent VTC links from disappearing. maybe move close links container elsewhere (not so easy, it turns out)?
// - VIM keybindings using CodeMirror or Ace for stack snippets

// REFS
// - https://stackoverflow.com/questions/20462544/greasemonkey-tampermonkey-match-for-a-page-with-parameters
// - https://github.com/CertainPerformance/Stack-Exchange-Userscripts

const removeAll = els => [...els].forEach(e => e.remove());
const tryRm = el => el && el.remove();

const flashErr = msg => {
  console.error(msg);
  const div = document.createElement("div");
  document.body.appendChild(div);
  setTimeout(() => document.body.removeChild(div), 3000);
  Object.assign(div.style, {
    position: "fixed",
    fontSize: "1em",
    margin: "0.5em",
    color: "#f77",
    background: "#400",
    borderRadius: "3px",
    padding: "0.4em",
  });
  div.textContent = msg;
};

const throttle = (fn, delayMs=3000) => {
  let lastCalled;
  return (...args) => {
    const called = Date.now();

    if (!lastCalled || called - lastCalled > delayMs) {
      lastCalled = called;
      fn(...args);
    }
  };
};

const post = (url, formData, onSuccess, onError) => {
  const fetchOpts = {
    body: formData,
    credentials: "same-origin",
    method: "POST",
  };
  fetch(url, fetchOpts)
    .then(res => res.json())
    .then(onSuccess)
    .catch(onError);
};

const postCloseVote = (reason, onSuccess, onError) => {
  const formData = new FormData();
  formData.append("fkey", window.StackExchange.options.user.fkey);
  formData.append("closeReasonId", reason.id);

  if (reason.id === "SiteSpecific") {
    formData.append("siteSpecificCloseReasonId", reason.siteSpecificId);
  }

  const questionId = location.href.match(/\d+/)[0];
  const url = `${location.origin}/flags/questions/${questionId}/close/add`;
  post(url, formData, onSuccess, onError);
};

const postRetractVote = (onSuccess, onError) => {
  const formData = new FormData();
  formData.append("fkey", window.StackExchange.options.user.fkey);
  const questionId = location.href.match(/\d+/)[0];
  const url = `${location.origin}/flags/questions/${questionId}/close/retract`;
  post(url, formData, onSuccess, onError);
};

const shouldAddVoteContainer = () =>
  window.StackExchange.options.user.rep >= 3000 &&
  document.querySelector(".js-post-menu") &&
  !document.querySelector("#question.deleted-answer")
;

const shouldAddVoteLinks = () => {
  const closeQuestionLink = document.querySelector(".js-close-question-link");
  return closeQuestionLink &&
    !/reopen/i.test(closeQuestionLink.textContent) &&
    !/you voted/i.test(closeQuestionLink.title);
};

const onSuccess = response => {
  if (response.Success) {
    removeAll(document.querySelectorAll(".userscript-vote"));
    const closeLink = document.querySelector(".js-close-question-link");
    closeLink.innerText = `Close (${response.Count || 0})`;

    if (response.ResultChangedState) {
      window.location.href = window.location.href;
    }

    return true;
  }

  flashErr(response.Message);
  return false;
};

const addRetractLink = container => {
  const a = document.createElement("a");
  container.appendChild(a);
  a.innerText = "retract";
  a.className = "userscript-vote";
  a.addEventListener("click", event => {
    event.preventDefault();
    postRetractVote(onSuccess, flashErr);
  });
};

const addVoteContainer = () => {
  const container = document.createElement("div");
  container.className = "userscript-vote-container";
  document.querySelector(".js-post-menu")
    .parentNode.prepend(container);

  if (shouldAddVoteLinks()) {
    addVoteLinks(container);
  }
  else {
    addRetractLink(container);
  }
};

const addVoteLinks = container => {
  const closeReasons = [
    {
      id: "NeedsDetailsOrClarity",
      label: "unclear"
    },
    {
      id: "SiteSpecific",
      label: "mcve",
      siteSpecificId: 13
    },
    {
      id: "NeedMoreFocus",
      label: "broad"
    },
    {
      id: "OpinionBased",
      label: "opinion"
    },
    {
      id: "SiteSpecific",
      label: "offsite",
      siteSpecificId: 16
    },
    {
      id: "SiteSpecific",
      label: "typo",
      siteSpecificId: 11
    },
    {
      id: "SiteSpecific",
      label: "non-programming",
      siteSpecificId: 18
    },
  ];

  const postCloseVoteThrottled = throttle(postCloseVote);

  closeReasons.forEach(e => {
    const a = document.createElement("a");
    container.appendChild(a);
    a.innerText = e.label;
    a.className = "userscript-vote";
    a.addEventListener("click", event => {
      event.preventDefault();
      const success = response => {
        if (onSuccess(response)) {
          addRetractLink(container);
        }
      };
      postCloseVoteThrottled(e, success, flashErr);

      if (event.shiftKey) {
        const downvote = document.querySelector(".question .js-vote-down-btn");

        if (!downvote.className.includes("fc-theme-primary")) {
          downvote.click();
        }
      }
    });
  });

  const a = document.createElement("a");
  container.prepend(a);
  a.innerText = "dupe";
  a.className = "userscript-vote";
  a.addEventListener("click", async event => {
    document.querySelector(".js-close-question-link").click();
    const dupeRadioSel = "#closeReasonId-Duplicate";

    for (let i = 0; i++ < 9 && !document.querySelector(dupeRadioSel);) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const radio = document.querySelector(dupeRadioSel);
    radio && radio.click();
  });
};


const addStyleSheet = () => {
  const css = `
.userscript-vote-container {
  margin: 0;
}
.userscript-vote {
  display: inline-block;
  font-size: 1em;
  padding: 5px 5px 5px 0;
  color: #848d95;
}
.userscript-vote:hover {
  color: #3c4146;
}
.top-bar {
  position: absolute;
}
`;
  const style = document.createElement("style");

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  }
  else {
    style.appendChild(document.createTextNode(css));
  }

  document.querySelector("head").appendChild(style);
};

const tryCloseWelcomeBackBanner = () =>
  setTimeout(() => { // TODO MutationObserver
    const overlay = document.querySelector("#overlay-header");
    const msg = "Welcome back! If you found this question useful";

    if (overlay && overlay.innerText.includes(msg) &&
      overlay.querySelector(".close-overlay")) {
      overlay.querySelector(".close-overlay").click();
    }
  }, 1000)
;

const tryAddClipboardTitleLink = () => {
  const headerEl = document.querySelector("#question-header");

  if (!headerEl) {
    return;
  }

  const title = headerEl.textContent.trim()
    .replace(/ *\[(?:closed|duplicate)\]$/i, "")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
  ;
  const clipboardEl = document.createElement("a");
  headerEl.querySelector("h1").appendChild(clipboardEl);
  clipboardEl.innerText = "📋";
  clipboardEl.addEventListener("click", e => {
    navigator.clipboard.writeText(
      `[${title}](${window.location.href})`
    );
  });
};

const highlightUsername = username => {
  [...document.querySelectorAll(".comment-user")]
    .forEach(e => {
      if (e.textContent.trim() === username) {
        e.style.background = "#990";
      }
    })
  ;
  [...document.querySelectorAll(".user-details")]
    .forEach(e => {
      if (e.textContent.includes(username)) {
        e.style.background = "#990";
      }
    })
  ;
};

(() => {
  removeAll(document.querySelectorAll(".user-gravatar32"));
  tryRm(document.querySelector(".s-sidebarwidget"));
  tryRm(document.getElementsByClassName("-marketing-link js-gps-track js-products-menu")[0]);
  tryRm(document.getElementsByClassName("-main grid--cell")[0]);
  tryRm(document.querySelector(".ml12"));
  tryRm(document.querySelector(".bottom-notice"));
  tryRm(document.querySelector("footer"));
  tryRm(document.querySelector(".s-sidebarwidget.js-join-leave-container.mb16"));

  if (shouldAddVoteContainer()) {
    addVoteContainer();
  }

  tryAddClipboardTitleLink();
  addStyleSheet();
  tryCloseWelcomeBackBanner();
  highlightUsername("ggorlen");

  // TODO needs more validation -- temporary
  setTimeout(() => {
    const banner = document.querySelector("[title='Dismiss']") ||
      document.querySelector(".js-dismiss");

    if (banner) {
      banner.click();
    }
  }, 2000);

  new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {

        // when the flag modal opens, select the most common option
        const sel = '#comment-flag-type-CommentNoLongerNeeded';
        document.querySelector(sel)?.click();
      }
    }
  }).observe(
    document.body,
    {attributes: true, childList: true, subtree: true}
  );
})();
