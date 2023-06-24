(() => {
  window.addEventListener("message", function (event) {
    if (event.source === window) {
      if (event.data.type === "storeAssemblyCode") {
        // store the code
        chrome.storage.sync.set({ code: event.data.data }, null);

        // send to background.js to know this website load is the website to paste code
        chrome.runtime.sendMessage({ command: "waitThenPaste" });
      }

      if (event.data.type === "storeBookmarkCode") {
        storeBookmarkCode(event.data.data);
      }
    }
  });

  const storeBookmarkCode = (jsonData) => {
    chrome.storage.sync.get("bookmarks", function (result) {
      var newBookmark = result.bookmarks;
      var newKey = 0;
      if (Object.keys(newBookmark).length > 0) {
        const keys = Object.keys(newBookmark);
        newKey = keys[keys.length - 1];
        newKey = +newKey + 1;
      }

      newBookmark[newKey] = jsonData;
      chrome.storage.sync.set({ bookmarks: newBookmark }, null);
      console.log(newBookmark);
    });
  };

  const runPageActions = (request) => {
    switch (request.command) {
      case "resetGReg":
        window.postMessage({ type: "activateClearReg" }, "*");
        break;

      case "saveToText":
        chrome.storage.sync.get("file_name", function (result) {
          const fileName = result.file_name;
          window.postMessage(
            { type: "activateDownloadCode", fileName: fileName },
            "*"
          );
        });

        break;

      case "refresh":
        window.postMessage({ type: "activateRefresh" }, "*");
        break;

      case "updateFileName":
        chrome.storage.sync.set({ file_name: request.data }, null);
        break;

      case "pasteCodeToAssembler":
        window.postMessage(
          {
            type: "pasteAssemblyCode",
            data: request.data,
            fileName: request.fileName,
          },
          "*"
        );
        break;

      case "verifyAssemblyCode":
        window.postMessage({ type: "verifyAssemblyCode" }, "*");
        break;
    }
  };

  const elementForInjectingScript = document.createElement("script");
  elementForInjectingScript.src = chrome.runtime.getURL("pageActions.js");
  document.body.appendChild(elementForInjectingScript);
  elementForInjectingScript.addEventListener("onload", runPageActions);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    runPageActions(request);
    sendResponse({ status: "Complete" });
  });
})();
