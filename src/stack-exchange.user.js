// ==UserScript==
// @name         Stack Overflow Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Offers one-click votes and hides noisy features
// @author       ggorlen
// @match        https://stackoverflow.com/questions*
// @match        https://askubuntu.com/questions*
// @include      /https://.*?\.stackexchange\.com/questions*
// @grant        none
// ==/UserScript==

// TODO
// - script to auto-cast delete votes on posts I've closed
// - "show 1 comment" should be clicked with a MutationObserver
// - VTC with custom reason
// - add (1) for votes other people have cast for a particular reason (might be more trouble than its worth)
// - make sure downvotes don't toggle on shift-clicks
// - auto-click to accept reopen popups and other prompts.
// - don't show retract link if post is closed.
// - voting then retracting shouldn't re-show links if possible.
// - when someone else edits the post, prevent links from disappearing. maybe move close links container elsewhere (not so easy, it turns out)?
// - casting offsite (and possibly other types) of close votes on old posts gives a 500 response.

// REFS
// - https://stackoverflow.com/questions/20462544/greasemonkey-tampermonkey-match-for-a-page-with-parameters
// - https://github.com/CertainPerformance/Stack-Exchange-Userscripts

const removeAll = els => [...els].forEach(e => e.remove());

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

const shouldAddVoteLinks = () => {
  const myProfile = document.querySelector(".my-profile");

  if (!myProfile || window.StackExchange.options.user.rep < 3000) {
    return false;
  }

  const closeQuestionLink = document.querySelector(".close-question-link");

  if (!closeQuestionLink ||
    document.querySelector('#question.deleted-answer') ||
    closeQuestionLink.textContent === "reopen" ||
    closeQuestionLink.title.includes("You voted")) {
     return false;
  }

  return true;
};

const onSuccess = response => {
  if (response.Success) {
    removeAll(document.querySelectorAll(".userscript-vote"));
    const closeLink = document.querySelector(".close-question-link");
    closeLink.innerText = `close (${response.Count || 0})`;

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
      label: "gen.comp.",
      siteSpecificId: 4
    },
    {
      id: "SiteSpecific",
      label: "serv/netw",
      siteSpecificId: 7
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
    document.querySelector(".close-question-link").click();
    const dupeRadioSel = "#closeReasonId-Duplicate";

    for (let i = 0; i++ < 9 && !document.querySelector(dupeRadioSel);) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const radio = document.querySelector(dupeRadioSel);
    radio && radio.click();
  });
};

(function () {
  document.querySelector(".s-sidebarwidget").remove();
  removeAll(document.querySelectorAll(".user-gravatar32"));
  const container = document.createElement("div");
  container.className = "userscript-vote-container";
  document.querySelector(".post-menu")
      .parentNode.prepend(container);
  //remove(document.querySelector(".list-reset"));

  if (shouldAddVoteLinks()) {
    addVoteLinks(container);
  }
  else {
    addRetractLink(container);
  }

  document.querySelector("footer").remove();

  const css = `
.userscript-vote-container {
  margin: 0px 16px 0px 0px;
}
.userscript-vote {
  display: inline-block;
  font-size: 1em;
  padding: 0 4px 2px;
  color: #848d95;
}
.userscript-vote:hover {
  color: #3c4146;
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

  setTimeout(() => { // TODO MutationObserver
    const overlay = document.querySelector("#overlay-header");
    const msg = "Welcome back! If you found this question useful";

    if (overlay && overlay.innerText.includes(msg) &&
      overlay.querySelector(".close-overlay")) {
      overlay.querySelector(".close-overlay").click();
    }
  }, 1000);
})();

