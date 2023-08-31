const openDocBtn = document.getElementById("openDoc");
openDocBtn.onclick = function (e) {
  window.open("https://github.com/yycorcino/byte-lobster/wiki", "_blank");
};

const openFeatureRequestBtn = document.getElementById("openFeatureReq");
openFeatureRequestBtn.onclick = function (e) {
  window.open(
    "https://github.com/yycorcino/byte-lobster/issues/new?assignees=&labels=&projects=&template=feature_request.yaml",
    "_blank"
  );
};

const openBugReportBtn = document.getElementById("openBugRep");
openBugReportBtn.onclick = function (e) {
  window.open(
    "https://github.com/yycorcino/byte-lobster/issues/new?assignees=&labels=&projects=&template=bug_report.yaml",
    "_blank"
  );
};

const closeBannerBtn = document.getElementById("closeBanner");
closeBannerBtn.onclick = function (e) {
  const checkbox = document.querySelector('input[name="showAgain"]');
  if (checkbox.checked) {
    chrome.storage.sync.set({ show_banner: false }, null);
  }

  this.parentElement.parentElement.style.display = "none";
};

// when the pages renders decides if banner is visible
chrome.storage.sync.get("show_banner", function (result) {
  const showBanner = result.show_banner;
  // if not showBanner then hide banner
  if (!showBanner) {
    const alertBanner = document.getElementsByClassName("alert")[0];
    alertBanner.style.display = "none";
  }
});
