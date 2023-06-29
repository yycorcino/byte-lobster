const getAssemblyCode = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("bookmarks", function (result) {
      const bookmarkDict = result.bookmarks;
      resolve(convertJsonToString(bookmarkDict[key]));
    });
  });
};

const convertJsonToString = (sTxt) => {
  const string = Object.values(sTxt)
    .filter((line) => line.replace(/\u200B/g, ""))
    .join("\n");

  var pattern = /[\u200B-\u200D\uFEFF]/g;
  if (pattern.test(sTxt)) {
    return "JSON to String Issue!!";
  } else {
    return string;
  }
};

const createFileName = (e) => {
  const bookmark = e.target.closest(".bookmark-content");
  if (bookmark) {
    const textContent = bookmark.textContent.trim();
    const bookmarkFileName = textContent.replace("Bookmark #: ", "Bookmark-");
    return bookmarkFileName;
  }
};

const getBookmarkIdentifier = (e) => {
  const id = e.target.closest(".bookmark-content").id;
  const key = id.slice(9);
  return { id, key };
};

const updateBookmarkAppearance = async (e, base = 0) => {
  var bookmark = e;
  if (base === 0) {
    bookmark = e.target.parentNode.parentNode;
  }

  const classList = bookmark.classList;
  var active = classList.contains("active");
  bookmark.classList.toggle("active", !active);
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

const removeModalContent = () => {
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    modalContent.remove();
  }
};

const deleteAllBookmarks = () => {
  var bookmarkContainer = document.querySelector(".bookmark-container");
  if (bookmarkContainer) {
    bookmarkContainer.parentElement.removeChild(bookmarkContainer);
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

export {
  createFileName,
  getBookmarkIdentifier,
  removeModalContent,
  deleteAllBookmarks,
  removeMouseEvents,
  mouseEnterPreview,
  mouseLeavePreview,
};
