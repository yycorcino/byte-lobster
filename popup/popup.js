import { getActiveTabURL } from "../assets/utils.js";

const sendToContentScripts = async (command, data = "noData", btnName) => {
  // determine which tab to send message
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  let callObj = { command: command };
  if (data !== "noData") {
    callObj = { command: command, data: data };
  }

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
      <span class="closebtn">&times;</span>
      <strong>Success!</strong> File Name is Updated.
    `;
  } else {
    alertDiv.className = "alert";
    alertDiv.innerHTML = `
      <span class="closebtn">&times;</span>
      <strong>Danger!</strong> File Name is Invalid.
    `;
  }
  const settingsTab = document.querySelector("div.settingsTab");
  settingsTab.appendChild(alertDiv);
  removeAlert();
};

const removeAlert = () => {
  var closeBtn = document.querySelector("div.alert .closebtn");

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

document.addEventListener("DOMContentLoaded", async () => {
  const settingsTab = document.querySelector(".settingsTab");
  const settingsBtn = document.getElementById("settings");
  settingsBtn.onclick = async function (e) {
    mainTab.classList.toggle("animate");
    settingsTab.classList.toggle("animate");
  };

  const mainTab = document.querySelector(".mainTab");
  const goMainTabBtn = document.getElementById("goToMainTab");
  goMainTabBtn.onclick = async function (e) {
    settingsTab.classList.toggle("animate");
    mainTab.classList.toggle("animate");
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

  const activeTab = await getActiveTabURL();

  if (!activeTab.url.includes("https://cpulator.01xz.net/?sys=arm")) {
    const container = document.getElementsByClassName("container")[0];

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
