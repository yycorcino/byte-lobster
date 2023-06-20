chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ file_name: "assembly" }, null);
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (
    ["link"].includes(details.transitionType) &&
    details.url === "https://cpulator.01xz.net/?sys=arm"
  ) {
    // waits for webpage to fully load -> pass data back to contentScripts.js
    setTimeout(() => {
      chrome.storage.sync.get("code", function (result) {
        const codeJson = result.code;

        chrome.tabs.sendMessage(details.tabId, {
          command: "onLoadRefreshSave",
          data: { key: codeJson },
        });
      });
    }, 1000);
  }
});
