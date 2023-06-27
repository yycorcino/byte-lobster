import { sendToContentScripts } from "../common/common.js";
import {
  getAssemblyCode,
  createFileName,
  getBookmarkIdentifier,
  updateBookmarkAppearance,
  removeModalContent,
  deleteAllBookmarks,
} from "./bookmarkHelper.js";

document.addEventListener("activateDeleteAllBookmarks", function (event) {
  deleteAllBookmarks();
});

document.addEventListener("activateAddAllBookmarks", function (event) {
  addAllBookmarks();
});

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

      const bookmarkContainerHeading = document.createElement("span");
      bookmarkContainerHeading.className = "title";
      bookmarkContainerHeading.id = "bookmarkHeading";
      bookmarkContainerHeading.style.paddingTop = "7px";
      bookmarkContainerHeading.innerHTML = "Your Bookmarks:";
      bookmarksContainer.appendChild(bookmarkContainerHeading);

      const allKeys = Object.keys(bookmarkDict);
      for (let i = 0; i < bookmarkDictLength; i++) {
        createBookmarks(allKeys[i]);
      }

      // possible new scheme for add new elements
      bookmarksContainer.appendChild(
        Object.assign(document.createElement("div"), { id: "modal" })
      );
    }
  });
};

const createBookmarks = (key) => {
  const bookmarkContent = document.createElement("div");
  bookmarkContent.className = "bookmark-content";
  bookmarkContent.id = "bookmark-" + key;

  const bookmarkTitle = document.createElement("div");
  bookmarkTitle.className = "bookmark-title";
  const onlyNumbers = /^\d+$/;
  if (onlyNumbers.test(key)) {
    bookmarkTitle.textContent = "Bookmark #: " + key;
  } else {
    bookmarkTitle.textContent = key;
  }

  const controlElementsDiv = document.createElement("div");
  controlElementsDiv.className = "bookmark-controls";
  setBookmarkControls(
    "preview",
    "#3399CC",
    removeMouseEvents,
    controlElementsDiv
  );
  setBookmarkControls("paste", "#238637", onPaste, controlElementsDiv);
  setBookmarkControls("download", "#FF8C00", onDownload, controlElementsDiv);
  setBookmarkControls("delete", "#FA5744", onDelete, controlElementsDiv);

  // append to bookmark content to scroll and scroll to bookmark container
  var bookmarkScrollWindow = document.querySelector(".scroll-bookmark");
  const bookmarkContainer = document.querySelector(".bookmark-container");

  bookmarkContent.appendChild(bookmarkTitle);
  bookmarkContent.appendChild(controlElementsDiv);
  if (!bookmarkScrollWindow) {
    bookmarkScrollWindow = document.createElement("div");
    bookmarkScrollWindow.className = "scroll-bookmark";
    bookmarkScrollWindow.appendChild(bookmarkContent);
    bookmarkContainer.appendChild(bookmarkScrollWindow);
  } else {
    bookmarkScrollWindow.appendChild(bookmarkContent);
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
  const svgFilePath = "../assets/images/svg/" + src + ".svg";
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
    controlElement.addEventListener("mouseenter", mouseEnterPreview);
    controlElement.addEventListener("mouseleave", mouseLeavePreview);
  }

  controlElement.addEventListener("click", eventListener);
  controlParentElem.appendChild(controlElement);
};

const removeMouseEvents = async (e, base = 0) => {
  /*
  When activate the element,
  click connected to onPreviewAddClick
  */
  var element = e;
  if (base === 0) {
    element = e.target.parentNode;
  }

  if (element.tagName === "I") {
    element.removeEventListener("mouseenter", mouseEnterPreview);
    element.removeEventListener("mouseleave", mouseLeavePreview);
    element.removeEventListener("click", removeMouseEvents);
    element.addEventListener("click", addMouseEvents);
  }
};

const addMouseEvents = async (e, base = 0) => {
  /*
  When activate the element,
  mouseenter connected to enterPreview
  mouseleave connected to leavePreview
  click connected to onPreviewAddClick
  */
  var element = e;
  if (base === 0) {
    element = e.target.parentNode;
  }

  if (element.tagName === "I") {
    element.addEventListener("mouseenter", mouseEnterPreview);
    element.addEventListener("mouseleave", mouseLeavePreview);
    element.removeEventListener("click", addMouseEvents);
    element.addEventListener("click", removeMouseEvents);
  }
};

const removeOtherBookmarkState = async () => {
  const activeBookmark = document.querySelector(".bookmark-content.active");
  if (activeBookmark) {
    removeModalContent();

    const iElement = document.querySelector(".bookmark-content.active i");
    addMouseEvents(iElement, 1);

    await updateBookmarkAppearance(activeBookmark, 1);
  }
};

const mouseEnterPreview = async (e) => {
  // only one bookmark can be active at a time
  await removeOtherBookmarkState();
  updateBookmarkAppearance(e);

  const modalDiv = document.querySelector("#modal");
  const contentDiv = document.createElement("div");
  contentDiv.className = "modal-content";
  modalDiv.appendChild(contentDiv);

  const { key } = getBookmarkIdentifier(e);
  const previewTag = document.createElement("pre");
  getAssemblyCode(key)
    .then((codeString) => {
      previewTag.textContent = codeString;
      contentDiv.appendChild(previewTag);
    })
    .catch((error) => {
      console.error(error);
    });
};

const mouseLeavePreview = async (e) => {
  updateBookmarkAppearance(e);
  removeModalContent();
};

const onPaste = async (e) => {
  const bookmarkFileName = createFileName(e);

  const { key } = getBookmarkIdentifier(e);
  chrome.storage.sync.get("bookmarks", function (result) {
    const bookmarkDict = result.bookmarks;
    sendToContentScripts(
      "pasteCodeToAssembler",
      bookmarkDict[key],
      bookmarkFileName
    );
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
  const bookmarkFileName = createFileName(e);

  // const { key } = getBookmarkIdentifier(e);
  // chrome.storage.sync.get("bookmarks", function (result) {
  //   const bookmarkDict = result.bookmarks;
  //   sendToContentScripts(
  //     "saveToText",
  //     bookmarkDict[key],
  //     bookmarkFileName
  //   );
  // });
};

document.addEventListener("DOMContentLoaded", async () => {
  // dynamically update bookmarks
  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmarkDict = result.bookmarks;
    if (Object.keys(newBookmarkDict).length !== 0) {
      addAllBookmarks();
    }
  });
});
