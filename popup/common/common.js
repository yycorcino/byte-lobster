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

export { sendToContentScripts };
