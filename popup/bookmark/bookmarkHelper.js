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

  if (active) {
    bookmark.classList.remove("active");
  } else {
    bookmark.classList.add("active");
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

export {
  getAssemblyCode,
  createFileName,
  getBookmarkIdentifier,
  updateBookmarkAppearance,
  removeModalContent,
  deleteAllBookmarks,
};
