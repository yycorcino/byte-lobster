(() => {
  const newEnvironment = () => {
    // add bookmark onto ARM CPUlator
    const editorToolbar = document.querySelector("#qasm_compile").parentElement;
    const bookmarkBtn = document.createElement("button");
    bookmarkBtn.textContent = "Bookmark Code";
    bookmarkBtn.addEventListener("click", addBookmarkEntry);

    const secondItem = editorToolbar.children[1];
    editorToolbar.insertBefore(bookmarkBtn, secondItem);
  };

  const addBookmarkEntry = () => {
    const editorDiv = document.querySelector("#qasm_box");
    editorDiv.style.background = "#fff9c4";

    setTimeout(() => {
      editorDiv.style.background = "#ececec"; // Set the new background color after three seconds
    }, 500);

    window.postMessage({ type: "bookmarkCode" }, "*");
  };

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.command === "bookmarkInit") {
      newEnvironment();
    }
  });
})();
