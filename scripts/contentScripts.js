(() => {
  const runPageActions = (request) => {
    switch (request.command) {
      case "activateClearGReg":
        window.postMessage({ type: "activateClearGReg" }, "*");
        break;

      case "activateDOMDownload":
        chrome.storage.sync.get("file_name", function (result) {
          const fileName = result.file_name;
          window.postMessage(
            { type: "activateDOMDownload", fileName: fileName },
            "*"
          );
        });
        break;

      case "activateDataPassDownload":
        window.postMessage(
          {
            type: "activateDataPassDownload",
            data: request.data,
            fileName: request.fileName,
          },
          "*"
        );
        break;

      case "refresh":
        window.postMessage({ type: "activateRefresh" }, "*");
        break;

      case "updateFileName":
        chrome.storage.sync.set({ file_name: request.data }, null);
        break;

      case "activatePasteAssemblyCode":
        window.postMessage(
          {
            type: "activatePasteAssemblyCode",
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

  // receiving from pageActions.js
  window.addEventListener("message", function (event) {
    if (event.source === window) {
      if (event.data.type === "executeTempStoreAssemblyCode") {
        chrome.storage.sync.set({ code: event.data.data }, null);

        // send to background.js to know this website load is the website to paste code
        chrome.runtime.sendMessage({ command: "waitThenPaste" });
      }
    }
  });
})();
