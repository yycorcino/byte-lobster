(() => {
  window.addEventListener("message", function (event) {
    if (event.source === window) {
      if (event.data.type === "storeAssemblyCode") {
        // store the code
        chrome.storage.sync.set({ code: event.data.data }, null);

        // send to background.js to know this website load is the website to paste code
        chrome.runtime.sendMessage({ command: "waitThenPaste" });
      }
    }
  });

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

      case "dynamicSaveToText":
        console.log(request.data);
        console.log(request.fileName);
        window.postMessage(
          {
            type: "activateDownloadCode",
            data: request.data,
            fileName: request.fileName,
          },
          "*"
        );
        break;

      case "downloadAllBookmarks":
        console.log("got it");
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
