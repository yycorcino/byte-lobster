import { sendToContentScripts } from "../common/common.js";
import {
  createFileName,
  getBookmarkIdentifier,
  removeModalContent,
  deleteAllBookmarks,
  removeMouseEvents,
  mouseEnterPreview,
  mouseLeavePreview,
} from "./bookmarkHelper.js";

const addAllBookmarks = () => {
  chrome.storage.sync.get("bookmarks", function (result) {
    var bookmarkDict = result.bookmarks;
    const bookmarkDictLength = Object.keys(bookmarkDict).length;

    if (bookmarkDictLength > 0) {
      const mainTab = document.querySelector("#mainTab");

      const bookmarksContainer = document.createElement("div");
      bookmarksContainer.className = "bookmark-container";
      mainTab.appendChild(bookmarksContainer);

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "btn";
      downloadBtn.id = "downloadAllBookmarks";
      downloadBtn.textContent = "Download All Bookmarks";
      bookmarksContainer.appendChild(downloadBtn);

      const downloadElemBtn = document.getElementById("downloadAllBookmarks");
      downloadElemBtn.onclick = async function (e) {
        chrome.storage.sync.get("bookmarks", function (result) {
          const bookmarkDict = result.bookmarks;

          const format = 2;
          const command = "activateDataPassDownload";
          // condense all json to one json
          const mergedData = {};
          for (const jsonObj of Object.values(bookmarkDict)) {
            for (const [key, value] of Object.entries(jsonObj)) {
              if (mergedData.hasOwnProperty(key)) {
                const newKey = Math.max(...Object.keys(mergedData)) + 1;
                mergedData[newKey] = value;
              } else {
                mergedData[key] = value;
              }
            }
          }
          const btnName = "downloadAllBookmarks-btn";
          sendToContentScripts(format, command, mergedData, btnName);
        });
      };

      const bookmarkContainerHeading = document.createElement("span");
      bookmarkContainerHeading.className = "title";
      bookmarkContainerHeading.id = "bookmarkHeading";
      bookmarkContainerHeading.style.paddingTop = "7px";
      bookmarkContainerHeading.innerHTML = "Your Bookmarks:";
      bookmarksContainer.appendChild(bookmarkContainerHeading);

      const allKeys = Object.keys(bookmarkDict);
      for (let i = 0; i < bookmarkDictLength; i++) {
        createBookmark(allKeys[i]);
      }

      bookmarksContainer.appendChild(
        Object.assign(document.createElement("div"), { id: "modal" })
      );
    }
  });
};

const createBookmark = (key) => {
  const bookmarkContent = document.createElement("div");
  bookmarkContent.className = "bookmark-content";
  bookmarkContent.id = "bookmark-" + key;

  const bookmarkTitle = document.createElement("div");
  bookmarkTitle.className = "bookmark-title";
  bookmarkTitle.textContent = "Bookmark #: " + key;
  bookmarkContent.appendChild(bookmarkTitle);

  const controlElementsDiv = document.createElement("div");
  controlElementsDiv.className = "bookmark-controls";

  const propParentElement = controlElementsDiv;
  const previewProp = {
    src: "preview",
    fillColor: "#3399CC",
    clickListener: removeMouseEvents,
    parentElement: propParentElement,
  };
  const pasteProp = {
    src: "paste",
    fillColor: "#238637",
    clickListener: onPaste,
    parentElement: propParentElement,
  };
  const downloadProp = {
    src: "download",
    fillColor: "#FF8C00",
    clickListener: onDownload,
    parentElement: propParentElement,
  };
  const deleteProp = {
    src: "delete",
    fillColor: "#FA5744",
    clickListener: onDelete,
    parentElement: propParentElement,
  };

  const controlDivButtons = [previewProp, pasteProp, downloadProp, deleteProp];
  for (const button in controlDivButtons) {
    setBookmarkControls(
      controlDivButtons[button].src,
      controlDivButtons[button].fillColor,
      controlDivButtons[button].clickListener,
      controlDivButtons[button].parentElement
    );
  }
  bookmarkContent.appendChild(controlElementsDiv);

  // append to bookmark content to scroll and scroll to bookmark container
  var bookmarkScrollWindow = document.querySelector(".scroll-bookmark");
  const bookmarkContainer = document.querySelector(".bookmark-container");
  if (!bookmarkScrollWindow) {
    bookmarkScrollWindow = document.createElement("div");
    bookmarkScrollWindow.className = "scroll-bookmark";
    bookmarkScrollWindow.appendChild(bookmarkContent);
    bookmarkContainer.appendChild(bookmarkScrollWindow);
  } else {
    bookmarkScrollWindow.appendChild(bookmarkContent);
  }
};

const setBookmarkControls = (src, fillColor, clickListener, parentElement) => {
  const controlElement = document.createElement("i");
  controlElement.className = "icon";
  controlElement.id = src;
  controlElement.title = src.charAt(0).toUpperCase() + src.slice(1);
  controlElement.style.backgroundColor = fillColor;

  // get svgFile and insert
  const svgFilePath = "../assets/images/svg/" + src + ".svg";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", svgFilePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      controlElement.innerHTML = xhr.responseText;
    }
  };
  xhr.send();
  controlElement.addEventListener("click", clickListener);
  parentElement.appendChild(controlElement);

  // preview is special
  if (src === "preview") {
    controlElement.addEventListener("mouseenter", mouseEnterPreview);
    controlElement.addEventListener("mouseleave", mouseLeavePreview);
  }
};

const onPaste = async (e) => {
  const { id, key } = getBookmarkIdentifier(e);

  chrome.storage.sync.get("bookmarks", function (result) {
    const bookmarkDict = result.bookmarks;

    const format = 2;
    const command = "activatePasteAssemblyCode";
    const data = bookmarkDict[key];
    const bookmarkFileName = createFileName(e);
    const btnName = "play-button-" + id;
    sendToContentScripts(format, command, data, bookmarkFileName, btnName);
  });
};

const onDelete = async (e) => {
  const { id, key } = getBookmarkIdentifier(e);
  const thisBookmark = document.getElementById(id);

  // delete modelContent if associated with this bookmark
  if (thisBookmark.classList.contains("active")) {
    removeModalContent();
  }
  thisBookmark.parentNode.removeChild(thisBookmark);

  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmarkDict = result.bookmarks;
    delete newBookmarkDict[key];

    chrome.storage.sync.set({ bookmarks: newBookmarkDict }, null);
    // no more bookmarks = no bookmark heading
    if (Object.keys(newBookmarkDict).length === 0) {
      deleteAllBookmarks();
    }
  });
};

const onDownload = async (e) => {
  const { id, key } = getBookmarkIdentifier(e);

  chrome.storage.sync.get("bookmarks", function (result) {
    const bookmarkDict = result.bookmarks;

    const format = 2;
    const command = "activateDataPassDownload";
    const data = bookmarkDict[key];
    const bookmarkFileName = createFileName(e);
    const btnName = "download-button-" + id;
    sendToContentScripts(format, command, data, bookmarkFileName, btnName);
  });
};

document.addEventListener("activateDeleteAllBookmarks", function (event) {
  deleteAllBookmarks();
});

document.addEventListener("activateAddAllBookmarks", function (event) {
  addAllBookmarks();
});

document.addEventListener("DOMContentLoaded", async () => {
  // dynamically update bookmarks
  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmarkDict = result.bookmarks;
    if (Object.keys(newBookmarkDict).length !== 0) {
      addAllBookmarks();
    }
  });
});
