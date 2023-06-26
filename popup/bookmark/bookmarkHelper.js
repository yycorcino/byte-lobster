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

const createFileName = (element) => {
  const textContent = element.target
    .closest(".bookmark-container")
    .textContent.trim();
  const bookmarkFileName = textContent.replace("Bookmark #: ", "Bookmark-");
  return bookmarkFileName;
};

const getBookmarkIdentifier = (element) => {
  const id = element.target.closest(".bookmark-container").id;
  const key = id.slice(9);
  return { id, key };
};

const closeModal = () => {
  const modalElement = document.getElementById("modal");
  modalElement.remove();
};

export { getAssemblyCode, createFileName, closeModal, getBookmarkIdentifier };
