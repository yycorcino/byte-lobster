import { getActiveTabURL } from "../assets/utils.js";
import { sendToContentScripts } from "./common/common.js";
import { createAlert } from "./common/common.js";

const restGRegBtn = document.getElementById("resetGReg");
restGRegBtn.onclick = async function (e) {
  sendToContentScripts(1, "activateClearGReg", "restGRegBtn");
};

const saveToTextBtn = document.getElementById("saveToText");
saveToTextBtn.onclick = async function (e) {
  sendToContentScripts(1, "activateDOMDownload", "saveToTextBtn");
};

const refreshBtn = document.getElementById("refresh");
refreshBtn.onclick = async function (e) {
  sendToContentScripts(1, "refresh", "refreshBtn");
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

document.addEventListener("DOMContentLoaded", async () => {
  const settingsTab = document.getElementById("settingsTab");
  const settingsBtn = document.getElementById("settings");
  settingsBtn.onclick = async function (e) {
    document.dispatchEvent(new CustomEvent("activateDeleteAllBookmarks"));
    mainTab.style.transform = "translateX(-100%)";
    settingsTab.classList.add("active");
    mainTab.classList.remove("active");
  };

  const mainTab = document.getElementById("mainTab");
  const goMainTabBtn = document.getElementById("goToMainTab");
  goMainTabBtn.onclick = async function (e) {
    // remove alert if leaving the tab
    var closeBtn = document.querySelector(
      "div.alert-container .alert-close-btn"
    );
    if (closeBtn) {
      var div = closeBtn.parentNode.parentNode;
      div.style.opacity = "0";
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    mainTab.style.transform = "translateX(0%)";
    mainTab.classList.add("active");
    settingsTab.classList.remove("active");
    document.dispatchEvent(new CustomEvent("activateAddAllBookmarks"));
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
        const format = 3;
        const command = "updateFileName";
        const data = fileNameInput.value;
        const btnName = "fileNameInput";
        sendToContentScripts(format, command, data, btnName);

        fileNameInput.placeholder = fileNameInput.value;
        fileNameInput.value = "";
        createAlert("success");
      } else {
        fileNameInput.value = "";
        createAlert("failed");
      }
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
