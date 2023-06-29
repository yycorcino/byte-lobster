(() => {
  const storageBookmarkCode = (jsonData) => {
    chrome.storage.sync.get("bookmarks", function (result) {
      var newBookmark = result.bookmarks;

      // generates unique key
      // newKey is determine by [current keys length + 1]
      var newKey = 0;
      if (Object.keys(newBookmark).length > 0) {
        const keys = Object.keys(newBookmark);
        newKey = keys[keys.length - 1];
        newKey = +newKey + 1;
      }

      newBookmark[newKey] = jsonData;
      chrome.storage.sync.set({ bookmarks: newBookmark }, null);
    });
  };

  const addBookmarkEntry = () => {
    /*
     When "Bookmark Code" Btn pressed -> sends to pageActions.js -> back to bookmarkScripts.js.
     */
    const editorDiv = document.querySelector("#qasm_box");
    editorDiv.style.background = "#fff9c4";

    setTimeout(() => {
      editorDiv.style.background = "#ececec"; // set the new background color after 500 ms
    }, 500);

    window.postMessage({ type: "getBookmarkCode" }, "*");
  };

  const newEnvironment = () => {
    // add bookmark onto ARM CPUlator
    const editorToolbar = document.querySelector("#qasm_compile").parentElement;
    const bookmarkBtn = document.createElement("button");
    bookmarkBtn.textContent = "Bookmark Code";
    bookmarkBtn.addEventListener("click", addBookmarkEntry);

    const secondItem = editorToolbar.children[1];
    editorToolbar.insertBefore(bookmarkBtn, secondItem);
  };

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.command === "activeNewEnvironment") {
      newEnvironment();
    }
  });

  window.addEventListener("message", function (event) {
    if (event.source === window) {
      if (event.data.type === "activateStorageBookmarkCode") {
        storageBookmarkCode(event.data.data);
      }
    }
  });
})();
