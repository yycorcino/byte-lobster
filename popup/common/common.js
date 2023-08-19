/**
 * Sends data to the contentScripts.js -> directs it to pageActions.js to interact with the DOM.
 *
 * @param {number} format - The format of the call object.
 *      - 1: callObj = { command: command, fileName: fileName };
 *      - 2: callObj = { command: command, data: data, fileName: fileName };
 * @param {string} command - The destination function in pageActions.
 * @param {object} data - The data to be used for interaction.
 * @param {string} fileName - The name of the file.
 * @param {string} btnName - The name of the button.
 * @returns {void}
 *
 * @example
 *   sendToContentScripts(
 *     2,
 *     "activatePasteAssemblyCode",
 *     {1:".global _start", 2:"_start:"},
 *     "Bookmark-1",
 *     "play-button-1"
 *   );
 */

const sendToContentScripts = async (
  format,
  command,
  data,
  fileName,
  btnName
) => {
  // determine which tab to send message
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);

  let callObj;
  switch (format) {
    case 1:
      callObj = { command: command, fileName: fileName };
      break;
    case 2:
      callObj = { command: command, data: data, fileName: fileName };
      break;
    case 3:
      callObj = { command: command, data: data };
      break;
  }

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

/**
 * Create an alert banner.
 *
 * @param {string} type - Custom alert based on type.
 */

const createAlert = (type) => {
  var alertWrapper = document.querySelector("div.alert-wrapper");
  if (alertWrapper) {
    alertWrapper.remove();
  }

  var alertDiv = document.createElement("div");
  alertWrapper = document.createElement("div");
  alertWrapper.className = "alert-wrapper";
  alertWrapper.appendChild(alertDiv);

  if (type === "success") {
    alertDiv.classList.add("alert-container", "success");
    alertDiv.innerHTML = `
      <span class="alert-message"><strong>Success!</strong>&nbsp;File Name is Updated.</span>
      <span class="alert-close-btn">&times;</span>
    `;
  } else {
    alertDiv.className = "alert-container";
    alertDiv.innerHTML = `
      <span class="alert-message"><strong>Danger!</strong>&nbsp;File Name is Invalid.</span>
      <span class="alert-close-btn">&times;</span>
    `;
  }
  const settingsTab = document.querySelector("#settingsTab");
  settingsTab.appendChild(alertWrapper);
  removeAlert();
};

/**
 * Function for alert-close-btn and automatically close alert banner within 4 secs.
 */

const removeAlert = () => {
  var closeBtn = document.querySelector("div.alert-container .alert-close-btn");

  //   remove in 4 secs
  setTimeout(function () {
    var div = closeBtn.parentNode.parentNode;
    setTimeout(function () {
      div.style.opacity = "0";
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }, 400);
  }, 4000);

  // option to close before 4 secs
  closeBtn.onclick = function () {
    var div = this.parentNode.parentNode;
    div.style.opacity = "0";
    setTimeout(function () {
      div.parentNode.removeChild(div);
    }, 300);
  };
};

export { sendToContentScripts, createAlert };
