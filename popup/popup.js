import { getActiveTabURL } from "../assets/utils.js";

const restGRegBtn = document.getElementById("resetGReg");
restGRegBtn.onclick = async function (e) {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  // sends message to contentScripts.js
  chrome.tabs.sendMessage(
    tabs[0].id,
    { command: "resetGReg" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("resetGRegBtn - " + response.status);
      }
    }
  );
};

const saveToTextBtn = document.getElementById("saveToText");
saveToTextBtn.onclick = async function (e) {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  // sends message to contentScripts.js
  chrome.tabs.sendMessage(
    tabs[0].id,
    { command: "saveToText" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("saveToTextBtn - " + response.status);
      }
    }
  );
};

const clearMemBtn = document.getElementById("clearMem");
clearMemBtn.onclick = async function (e) {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  // sends message to contentScripts.js
  chrome.tabs.sendMessage(
    tabs[0].id,
    { command: "clearMem" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("clearMemBtn - " + response.status);
      }
    }
  );
};

const refreshBtn = document.getElementById("refresh");
refreshBtn.onclick = async function (e) {
  // reloads page
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.reload(tabs[0].id);
  });

  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  // sends message to contentScripts.js
  chrome.tabs.sendMessage(
    tabs[0].id,
    { command: "refresh" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("refreshBtn - " + response.status);
      }
    }
  );
};

const settingsBtn = document.getElementById("settingsPage");
settingsBtn.onclick = async function (e) {
  chrome.tabs.query({}, function (tabs) {
    var settingsExist = false;
    var tabId;
    tabs.forEach(function (tab) {
      if (tab.url.includes("/settings/settings.html")) {
        settingsExist = true;
        tabId = tab.id;
      }
      console.log(tab.url);
    });

    if (settingsExist) {
      chrome.tabs.update(tabId, { active: true });
    } else {
      chrome.tabs.create({ url: "./settings/settings.html" });
    }
  });
};

// handles if current tab is CPUlator ARM
document.addEventListener("DOMContentLoaded", async () => {
  var mainTab = document.querySelector(".mainTab");
  var settingsTab = document.querySelector(".settingsTab");

  const settingsBtn = document.getElementById("settings");
  settingsBtn.onclick = async function (e) {
    mainTab.classList.toggle("animate");
    settingsTab.classList.toggle("animate");
    // let queryOptions = { active: true, currentWindow: true };
    // let tabs = await chrome.tabs.query(queryOptions);
    // // sends message to contentScripts.js
    // chrome.tabs.sendMessage(
    //   tabs[0].id,
    //   { command: "settings" },
    //   function (response) {
    //     if (chrome.runtime.lastError) {
    //       console.error(chrome.runtime.lastError);
    //     } else {
    //       console.log("settingsBtn - " + response.status);
    //     }
    //   }
    // );
  };

  const goMainTabBtn = document.getElementById("goToMainTab");
  goMainTabBtn.onclick = async function (e) {
    settingsTab.classList.toggle("animate");
    mainTab.classList.toggle("animate");
    // let queryOptions = { active: true, currentWindow: true };
    // let tabs = await chrome.tabs.query(queryOptions);
    // // sends message to contentScripts.js
    // chrome.tabs.sendMessage(
    //   tabs[0].id,
    //   { command: "goToMainTab" },
    //   function (response) {
    //     if (chrome.runtime.lastError) {
    //       console.error(chrome.runtime.lastError);
    //     } else {
    //       console.log("settingsBtn - " + response.status);
    //     }
    //   }
    // );
  };

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
