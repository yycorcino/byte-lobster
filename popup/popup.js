import { getActiveTabURL, jsonToString } from "../assets/utils.js";

const sendToContentScripts = async (
  command,
  data = "noData",
  fileName = "noFileName",
  btnName
) => {
  // determine which tab to send message
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  let callObj = { command: command };
  if (data !== "noData" && fileName === "noFileName") {
    callObj = { command: command, data: data };
  } else callObj = { command: command, data: data, fileName: fileName };

  // sends message to tab specific contentScripts.js
  chrome.tabs.sendMessage(tabs[0].id, callObj, function (response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log(`${btnName} - ${response.status}`);
    }
  });
};

const restGRegBtn = document.getElementById("resetGReg");
restGRegBtn.onclick = async function (e) {
  sendToContentScripts("resetGReg", "restGRegBtn");
};

const saveToTextBtn = document.getElementById("saveToText");
saveToTextBtn.onclick = async function (e) {
  sendToContentScripts("saveToText", "saveToTextBtn");
};

const refreshBtn = document.getElementById("refresh");
refreshBtn.onclick = async function (e) {
  sendToContentScripts("refresh", "refreshBtn");
};

const settingsBtn = document.getElementById("settingsPage");
settingsBtn.onclick = async function (e) {
  // determine if settings pages needs to be open
  chrome.tabs.query({}, function (tabs) {
    var settingsExist = false;
    var tabId;
    tabs.forEach(function (tab) {
      if (tab.url.includes("/settings/settings.html")) {
        settingsExist = true;
        tabId = tab.id;
      }
    });

    if (settingsExist) {
      chrome.tabs.update(tabId, { active: true });
    } else {
      chrome.tabs.create({ url: "./settings/settings.html" });
    }
  });
};

const createAlert = (type) => {
  let alertDiv = document.querySelector("div.alert");

  if (!alertDiv) {
    alertDiv = document.createElement("div");
  } else {
    alertDiv.remove();
  }

  if (type === "success") {
    alertDiv.classList.add("alert", "success");
    alertDiv.innerHTML = `
      <span class="alert-close-btn">&times;</span>
      <strong>Success!</strong> File Name is Updated.
    `;
  } else {
    alertDiv.className = "alert";
    alertDiv.innerHTML = `
      <span class="alert-close-btn">&times;</span>
      <strong>Danger!</strong> File Name is Invalid.
    `;
  }
  const settingsTab = document.querySelector("#settingsTab");
  settingsTab.appendChild(alertDiv);
  removeAlert();
};

const removeAlert = () => {
  var closeBtn = document.querySelector("div.alert .alert-close-btn");

  // remove in 4 secs
  setTimeout(function () {
    var div = closeBtn.parentElement;
    div.style.opacity = "0";
    setTimeout(function () {
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }, 400);
  }, 4000);

  // option to close before 4 secs
  closeBtn.onclick = function () {
    var div = this.parentElement;
    div.style.opacity = "0";
    setTimeout(function () {
      div.parentNode.removeChild(div);
    }, 300);
  };
};

const deleteAllBookmarks = () => {
  // check if bookmark exists
  var titles = document.querySelectorAll("span.title");
  var titleIsHere = false;

  titles.forEach((title) => {
    if (title.textContent === "Your Bookmarks:") {
      titleIsHere = true;
      title.parentElement.removeChild(title);
    }
  });

  if (titleIsHere) {
    var bookmarks = document.querySelectorAll(".bookmark-container");
    bookmarks.forEach((bookmark) => {
      bookmark.parentElement.removeChild(bookmark);
    });
  }
};

const addAllBookmarks = () => {
  chrome.storage.sync.get("bookmarks", function (result) {
    var bookmarks = result.bookmarks;
    const bookmarkLength = Object.keys(bookmarks).length;

    if (bookmarkLength > 0) {
      const bookmarkTitle = document.createElement("span");
      bookmarkTitle.className = "title";
      bookmarkTitle.style.paddingTop = "7px";
      bookmarkTitle.innerHTML = "Your Bookmarks:";

      const mainTab = document.querySelector("#mainTab");
      mainTab.appendChild(bookmarkTitle);

      const allKeys = Object.keys(bookmarks);
      for (let i = 0; i < bookmarkLength; i++) {
        createBookmarks(allKeys[i]);
      }
    }
  });
};

const createBookmarks = (fileKey) => {
  const mainTab = document.querySelector("#mainTab");

  const newBookmarkContainer = document.createElement("div");
  const bookmarkTitleElement = document.createElement("div");
  const controlElements = document.createElement("div");

  const onlyNumbers = /^\d+$/;
  if (onlyNumbers.test(fileKey)) {
    bookmarkTitleElement.textContent = "Bookmark #: " + fileKey;
  } else {
    bookmarkTitleElement.textContent = fileKey;
  }
  bookmarkTitleElement.className = "bookmark-title";
  controlElements.className = "bookmark-controls";

  setBookmarkControls("preview", "#3399CC", onPreview, controlElements);
  setBookmarkControls("paste", "#238637", onPaste, controlElements);
  setBookmarkControls("delete", "#FA5744", onDelete, controlElements);

  newBookmarkContainer.id = "bookmark-" + fileKey;
  newBookmarkContainer.className = "bookmark-container";

  newBookmarkContainer.appendChild(bookmarkTitleElement);
  newBookmarkContainer.appendChild(controlElements);
  mainTab.appendChild(newBookmarkContainer);
};

const setBookmarkControls = (
  src,
  fillColor,
  eventListener,
  controlParentElem
) => {
  const controlElement = document.createElement("i");

  // get svgFile
  const svgFilePath = "../assets/images/" + src + ".svg";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", svgFilePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      controlElement.innerHTML = xhr.responseText;
    }
  };
  xhr.send();

  controlElement.className = "icon";
  controlElement.title = src.charAt(0) + src.slice(1);
  controlElement.addEventListener("click", eventListener);
  controlElement.style.backgroundColor = fillColor;
  controlParentElem.appendChild(controlElement);
};

const onPreview = async (e) => {
  console.log("onPreview");
};

const onPaste = async (e) => {
  const textContent = e.target
    .closest(".bookmark-container")
    .textContent.trim();
  const bookmarkFileName = textContent.replace("Bookmark #: ", "Bookmark-");

  const { id, key } = getBookmarkIdAndKey(e);
  chrome.storage.sync.get("bookmarks", function (result) {
    const bookmark = result.bookmarks;
    console.log(bookmark[key]);
    sendToContentScripts(
      "pasteCodeToAssembler",
      bookmark[key],
      bookmarkFileName,
      "play-button-" + id
    );
  });
};

const getBookmarkIdAndKey = (elem) => {
  const id = elem.target.closest(".bookmark-container").id;
  const key = id.slice(9);
  return { id, key };
};

const onDelete = async (e) => {
  const { id, key } = getBookmarkIdAndKey(e);
  const bookmarkElementToDelete = document.getElementById(id);
  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.storage.sync.get("bookmarks", function (result) {
    var newBookmark = result.bookmarks;
    delete newBookmark[key];
    console.log(newBookmark);
    chrome.storage.sync.set({ bookmarks: newBookmark }, null);
  });
  // if no more bookmarks remove the title bar
};

document.addEventListener("DOMContentLoaded", async () => {
  const settingsTab = document.getElementById("settingsTab");
  const settingsBtn = document.getElementById("settings");
  settingsBtn.onclick = async function (e) {
    deleteAllBookmarks();
    mainTab.style.transform = "translateX(-100%)";
    settingsTab.classList.add("active");
    mainTab.classList.remove("active");
  };

  const mainTab = document.getElementById("mainTab");
  const goMainTabBtn = document.getElementById("goToMainTab");
  goMainTabBtn.onclick = async function (e) {
    mainTab.style.transform = "translateX(0%)";
    mainTab.classList.add("active");
    settingsTab.classList.remove("active");
    addAllBookmarks();
  };

  const fileNameInput = document.querySelector("#newFileName");
  // set place holder value
  chrome.storage.sync.get("file_name", function (result) {
    fileNameInput.placeholder = result.file_name;
  });

  fileNameInput.addEventListener("keyup", async (event) => {
    const invalidCharacters = /[<>:"\/\\|?*\x00-\x1F]/;
    const invalidSpaces = /^\s*$/;
    if (event.key === "Enter") {
      if (
        !invalidCharacters.test(fileNameInput.value) &&
        !invalidSpaces.test(fileNameInput.value)
      ) {
        sendToContentScripts(
          "updateFileName",
          fileNameInput.value,
          "fileNameInput"
        );

        fileNameInput.placeholder = fileNameInput.value;
        fileNameInput.value = "";
        createAlert("success");
      } else {
        fileNameInput.value = "";
        createAlert("failed");
      }
    }
  });

  // dynamically update bookmarks
  chrome.storage.sync.get("bookmarks", function (result) {
    if (result.bookmarks[0]) {
      addAllBookmarks();
    }
  });

  const activeTab = await getActiveTabURL();

  if (!activeTab.url.includes("https://cpulator.01xz.net/?sys=arm")) {
    const container = document.getElementsByClassName("tab-container")[0];

    container.innerHTML = `
    <div class="title">
        Open
        <a
            style="color: blue; text-decoration: none;"
            href="https://cpulator.01xz.net/?sys=arm"
            target="_blank"
        >
            ARM CPUlator.
        </a>
    </div>`;
  }
});
