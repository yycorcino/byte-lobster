export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

export const jsonToString = (sTxt) => {
  const string = Object.values(sTxt)
    .filter((line) => line.replace(/\u200B/g, ""))
    .join("\n");

  var pattern = /[\u200B-\u200D\uFEFF]/g;
  if (pattern.test(sTxt)) return "erorr";
  else return string;
};
