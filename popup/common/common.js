export const sendToContentScripts = async (
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
