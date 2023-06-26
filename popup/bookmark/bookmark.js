import { sendToContentScripts } from "../common/common.js";
import {
  getAssemblyCode,
  createFileName,
  closeModal,
  getBookmarkIdentifier,
} from "./bookmarkHelper.js";

document.addEventListener("activateDeleteAllBookmarks", function (event) {
  deleteAllBookmarks();
});

document.addEventListener("activateAddAllBookmarks", function (event) {
  addAllBookmarks();
});

const deleteAllBookmarks = () => {
  // check if bookmark exists
  var title = document.querySelector("#bookmarkTitle");

  if (title) {
    title.parentElement.removeChild(title);
    var bookmarkNodeList = document.querySelectorAll(".bookmark-container");
    bookmarkNodeList.forEach((bookmark) => {
      bookmark.parentElement.removeChild(bookmark);
    });
  }
};

const addAllBookmarks = () => {
  chrome.storage.sync.get("bookmarks", function (result) {
    var bookmarkDict = result.bookmarks;
    const bookmarkDictLength = Object.keys(bookmarkDict).length;

    if (bookmarkDictLength > 0) {
      const bookmarkTitle = document.createElement("span");
      bookmarkTitle.className = "title";
      bookmarkTitle.id = "bookmarkTitle";
      bookmarkTitle.style.paddingTop = "7px";
      bookmarkTitle.innerHTML = "Your Bookmarks:";

      const mainTab = document.querySelector("#mainTab");
      mainTab.appendChild(bookmarkTitle);

      const allKeys = Object.keys(bookmarkDict);
      for (let i = 0; i < bookmarkDictLength; i++) {
        createBookmarks(allKeys[i]);
      }
    }
  });
};

const createBookmarks = (key) => {
  const bookmarkContainer = document.createElement("div");
  bookmarkContainer.className = "bookmark-container";
  bookmarkContainer.id = "bookmark-" + key;

  const bookmarkTitle = document.createElement("div");
  bookmarkTitle.className = "bookmark-title";
  const onlyNumbers = /^\d+$/;
  if (onlyNumbers.test(key)) {
    bookmarkTitle.textContent = "Bookmark #: " + key;
  } else {
    bookmarkTitle.textContent = key; // going to be used for functionality for custom names
  }

  const controlElementsDiv = document.createElement("div");
  controlElementsDiv.className = "bookmark-controls";
  setBookmarkControls("preview", "#3399CC", "NA", controlElementsDiv);
  setBookmarkControls("paste", "#238637", onPaste, controlElementsDiv);
  setBookmarkControls("delete", "#FA5744", onDelete, controlElementsDiv);

  // append to bookmarkContainer then append to mainTab
  bookmarkContainer.appendChild(bookmarkTitle);
  bookmarkContainer.appendChild(controlElementsDiv);
  const mainTab = document.querySelector("#mainTab");
  mainTab.appendChild(bookmarkContainer);
};

const setBookmarkControls = (
  src,
  fillColor,
  eventListener,
  controlParentElem
) => {
  const controlElement = document.createElement("i");
  controlElement.className = "icon";
  controlElement.title = src.charAt(0).toUpperCase() + src.slice(1);
  controlElement.style.backgroundColor = fillColor;

  // get svgFile and insert
  const svgFilePath = "../assets/images/" + src + ".svg";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", svgFilePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      controlElement.innerHTML = xhr.responseText;
    }
  };
  xhr.send();

  // preview has special event listeners
  if (src === "preview") {
    controlElement.addEventListener("mouseenter", createAndShowPreview);
    controlElement.addEventListener("mouseleave", closeModal);
  } else {
    controlElement.addEventListener("click", eventListener);
  }
  controlParentElem.appendChild(controlElement);
};

const createAndShowPreview = async (e) => {
  const bookmarkContainer = e.target.parentNode.parentNode.parentNode;
  const modalDiv = document.createElement("div");
  modalDiv.id = "modal";
  modalDiv.onmouseleave = closeModal;
  bookmarkContainer.appendChild(modalDiv);

  const contentDiv = document.createElement("div");
  contentDiv.className = "modal-content";
  modalDiv.appendChild(contentDiv);

  const previewTag = document.createElement("pre");
  const { key } = getBookmarkIdentifier(e);
  getAssemblyCode(key)
    .then((codeString) => {
      previewTag.textContent = codeString;
      contentDiv.appendChild(previewTag);
    })
    .catch((error) => {
      console.error(error + " from createAndShowPreview");
    });
};

const onPaste = async (e) => {
  const bookmarkFileName = createFileName(e);

  const { id, key } = getBookmarkIdentifier(e);
  chrome.storage.sync.get("bookmarks", function (result) {
    const bookmarkDict = result.bookmarks;
    sendToContentScripts(
      "pasteCodeToAssembler",
      bookmarkDict[key],
      bookmarkFileName,
      "play-button-" + id
    );
  });
};

const onDelete = async (e) => {
  const { id, key } = getBookmarkIdentifier(e);
  const thisBookmark = document.getElementById(id);
  thisBookmark.parentNode.removeChild(thisBookmark);

  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmarkDict = result.bookmarks;
    delete newBookmarkDict[key];
    chrome.storage.sync.set({ bookmarks: newBookmarkDict }, null);

    // no more bookmarks = no bookmark title
    if (Object.keys(newBookmarkDict).length === 0) {
      var bookmarkTitle = document.querySelector("#bookmarkTitle");
      if (bookmarkTitle) {
        bookmarkTitle.parentElement.removeChild(bookmarkTitle);
      }
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  // dynamically update bookmarks
  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmark = result.bookmarks;
    if (Object.keys(newBookmark).length !== 0) {
      addAllBookmarks();
    }
  });
});
