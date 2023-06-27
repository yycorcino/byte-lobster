import { sendToContentScripts } from "../common/common.js";
import {
  getAssemblyCode,
  createFileName,
  removeModal,
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
    var bookmarkNodeList = document.querySelectorAll(".bookmark-content");
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

      const allKeys = Object.keys(bookmarkDict);
      for (let i = 0; i < bookmarkDictLength; i++) {
        createBookmarks(allKeys[i]);
      }

      const mainTab = document.querySelector("#mainTab");
      const referElem = document.querySelector(".scroll-bookmark");
      mainTab.insertBefore(bookmarkTitle, referElem);
    }
  });
};

const createBookmarks = (key) => {
  const bookmarkContainer = document.createElement("div");
  bookmarkContainer.className = "bookmark-content";
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
  setBookmarkControls(
    "preview",
    "#3399CC",
    onPreviewRemove,
    controlElementsDiv
  );
  setBookmarkControls("paste", "#238637", onPaste, controlElementsDiv);
  setBookmarkControls("delete", "#FA5744", onDelete, controlElementsDiv);

  // append to bookmark content to scroll and scroll to mainTab
  var bookmarkScrollWindow = document.querySelector(".scroll-bookmark");
  const mainTab = document.querySelector("#mainTab");

  bookmarkContainer.appendChild(bookmarkTitle);
  bookmarkContainer.appendChild(controlElementsDiv);
  if (!bookmarkScrollWindow) {
    bookmarkScrollWindow = document.createElement("div");
    bookmarkScrollWindow.className = "scroll-bookmark";
    bookmarkScrollWindow.appendChild(bookmarkContainer);
    mainTab.appendChild(bookmarkScrollWindow);
  } else {
    bookmarkScrollWindow.appendChild(bookmarkContainer);
  }
};

const setBookmarkControls = (
  src,
  fillColor,
  eventListener,
  controlParentElem
) => {
  const controlElement = document.createElement("i");
  controlElement.className = "icon";
  controlElement.id = src;
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

  // preview is special
  if (src === "preview") {
    controlElement.addEventListener("mouseenter", createAndShowPreview);
    controlElement.addEventListener("mouseleave", removeModal);
  }

  controlElement.addEventListener("click", eventListener);
  controlParentElem.appendChild(controlElement);
};

const deletePreview = () => {
  // if preview is clicked there is a modal
  // i want to delete modal, so every time a modal is loaded
  // only one modal exist
  //
  // - delete modal
  // - update that modal button to revert back to onPreviewRemove
};

const createAndShowPreview = async (e) => {
  const bookmarkContainer =
    e.target.parentNode.parentNode.parentNode.parentNode;
  const modalDiv = document.createElement("div");
  modalDiv.id = "modal";
  bookmarkContainer.appendChild(modalDiv);

  const contentDiv = document.createElement("div");
  contentDiv.className = "modal-content";
  modalDiv.appendChild(contentDiv);


  // add a way to scroll preview
  // need to create id for preview to reference
  const previewTag = document.createElement("pre");
  const { key } = getBookmarkIdentifier(e);
  getAssemblyCode(key)
    .then((codeString) => {
      previewTag.textContent = codeString;
      contentDiv.appendChild(previewTag);
    })
    .catch((error) => {
      console.error(error + " from createAndShowPreview bookmark");
    });
};

const onPreviewRemove = async (e) => {
  const element = e.target.parentNode;
  element.removeEventListener("mouseenter", createAndShowPreview);
  element.removeEventListener("mouseleave", removeModal);
  element.removeEventListener("click", onPreviewRemove);

  element.addEventListener("click", onPreviewAdd);
};

const onPreviewAdd = async (e) => {
  const element = e.target.parentNode;
  element.addEventListener("mouseenter", createAndShowPreview);
  element.addEventListener("mouseleave", removeModal);
  element.removeEventListener("click", onPreviewAdd);

  element.addEventListener("click", onPreviewRemove);
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
