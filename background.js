chrome.runtime.onInstalled.addListener(function () {
  // init values for chrome extension
  chrome.storage.sync.set({ file_name: "assembly" }, null);
  chrome.storage.sync.set({ code: "codeIsn'tSet" }, null);
  chrome.storage.sync.set({ bookmarks: {} }, null); // array of Json Object

  // init values for settings.html
  chrome.storage.sync.set({ show_banner: "true" }, null);

  // inject scripts into ARM webpages that are open already
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url == "https://cpulator.01xz.net/?sys=arm") {
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            files: [
              "./scripts/bookmarkScripts.js",
              "./scripts/contentScripts.js",
            ],
          })
          .then(() => {
            chrome.tabs.sendMessage(tab.id, {
              command: "activeNewEnvironment",
            });
          });
      }
    });
  });
});

const waitOnloadThenPaste = (details) => {
  if (
    ["link"].includes(details.transitionType) &&
    details.url === "https://cpulator.01xz.net/?sys=arm"
  ) {
    // waits for webpage to fully load -> pass data back to contentScripts.js
    setTimeout(() => {
      chrome.storage.sync.get("code", function (result) {
        const codeJson = result.code;

        chrome.tabs.sendMessage(details.tabId, {
          command: "activatePasteAssemblyCode",
          data: codeJson,
          fileName: "refresh",
        });
      });
    }, 1000);

    chrome.webNavigation.onCommitted.removeListener(waitOnloadThenPaste);
  }
};

// receiving from contentScripts.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "waitThenPaste") {
    chrome.webNavigation.onCommitted.addListener(waitOnloadThenPaste);
  }
});

const activeNewEnvironment = (id) => {
  // waits for webpage to fully load -> tell bookmarkScripts.js
  setTimeout(() => {
    chrome.tabs.sendMessage(id, {
      command: "activeNewEnvironment",
    });
  }, 1000);
};

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url === "https://cpulator.01xz.net/?sys=arm") {
    activeNewEnvironment(details.tabId);
  }
});

// handles shortcut presses
chrome.commands.onCommand.addListener((shortcutCommand) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      const id = tabs[0].id;

      if (url.includes("https://cpulator.01xz.net/?sys=arm")) {
        // shortcutCommand -> contentScript to execute on top of DOM (pageActions.js)
        chrome.tabs.sendMessage(id, { command: shortcutCommand });
      }
    }
  });
});
