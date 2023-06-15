(() => {
  const elementForInjectingScript = document.createElement("script");
  elementForInjectingScript.src = chrome.runtime.getURL("pageActions.js");
  document.body.appendChild(elementForInjectingScript);

  const runPageActions = (command) => {
    switch (command) {
      case "resetGReg":
        window.postMessage({ type: "activateClearReg" }, "*");
        break;

      case "saveToText":
        window.postMessage({ type: "activateFindCodeMirror" }, "*");
        break;

      case "clearMem":
        window.postMessage({ type: "activateClearMem" }, "*");
        break;

      case "refresh":
        window.postMessage({ type: "activateRefresh" }, "*");
        break;

      case "settings":
        window.postMessage({ type: "activateSettings" }, "*");
        break;
    }
  };

  elementForInjectingScript.addEventListener("onload", runPageActions);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    runPageActions(request.command);
    sendResponse({ status: "Complete" });
  });
})();
