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
