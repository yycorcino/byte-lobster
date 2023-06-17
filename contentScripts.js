(() => {
  window.addEventListener("message", function (event) {
    if (event.source === window && event.data.type === "storeAssemblyCode") {
      chrome.storage.sync.set({ code: event.data.data }, null);
    }
  });

  const elementForInjectingScript = document.createElement("script");
  elementForInjectingScript.src = chrome.runtime.getURL("pageActions.js");
  document.body.appendChild(elementForInjectingScript);

  const runPageActions = (request) => {
    switch (request.command) {
      case "resetGReg":
        window.postMessage({ type: "activateClearReg" }, "*");
        break;

      case "saveToText":
        chrome.storage.sync.get("file_name", function (result) {
          const fileName = result.file_name;
          window.postMessage(
            { type: "activateFindCodeMirror", fileName: fileName },
            "*"
          );
        });

        break;

      case "refresh":
        window.postMessage({ type: "activateRefresh" }, "*");
        break;

      case "updateFileName":
        chrome.storage.sync.set({ file_name: request.fileName }, null);
        break;

      case "onLoadRefreshSave":
        window.postMessage(
          { type: "pasteAssemblyCode", data: request.data.key },
          "*"
        );
        break;

      case "verifyAssemblyCode":
        window.postMessage({ type: "verifyAssemblyCode" }, "*");
        break;
    }
  };

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
