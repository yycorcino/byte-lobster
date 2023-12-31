window.addEventListener("message", function (event) {
  if (event.source === window) {
    if (event.data.type === "activateClearGReg") {
      findRegisterDiv();
      clearRegister();
    }

    if (event.data.type === "activateDOMDownload") {
      findAssemblyCode();
      const targetAssemblyCode = jsonToString(generateJson());
      downloadText(targetAssemblyCode, event.data.fileName);
    }

    if (event.data.type === "activateDataPassDownload") {
      const targetAssemblyCode = jsonToString(event.data.data);
      downloadText(targetAssemblyCode, event.data.fileName);
    }

    if (event.data.type === "activateRefresh") {
      // sends to contentScripts.js
      window.postMessage(
        { type: "executeTempStoreAssemblyCode", data: generateJson() },
        "*"
      );

      location.reload();
    }

    if (event.data.type === "activatePasteAssemblyCode") {
      pasteAssemblyCode(jsonToString(event.data.data), event.data.fileName);
    }

    if (event.data.type === "getBookmarkCode") {
      // sends to bookmarkScripts.js
      window.postMessage(
        { type: "activateStorageBookmarkCode", data: generateJson() },
        "*"
      );
    }
  }
});

const clearRegister = () => {
  registerList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (let i = 0; i < registerList.length; i++) {
    const registerVal = registerList[i];
    var targetRegister = `#reg_value_r${registerVal} input`;
    var inputElement = document.querySelector(targetRegister);

    if (inputElement) {
      inputElement.Ea = true;
      inputElement.value = "00000000";
      Hb.call(inputElement);
      Gb.call(inputElement);
    }
  }
};

const findRegisterDiv = () => {
  const registerDiv = document.querySelector("#reg_cm div.reg_block");
  if (!registerDiv) {
    const targetTab = Array.from(
      document.querySelectorAll(
        "div.tab-handle.disable-selection div.tab-handle-text"
      )
    ).find((element) => element.textContent.trim() === "Registers");
    targetTab.click();
  }
};

const generateJson = () => {
  let elem = document.querySelector("#qasm_cm div.CodeMirror-code");
  const sTxt = {};
  captureText(elem, sTxt);
  return sTxt;
};

const jsonToString = (sTxt) => {
  const string = Object.values(sTxt)
    .filter((line) => line.replace(/\u200B/g, ""))
    .join("\n");

  var pattern = /[\u200B-\u200D\uFEFF]/g;
  if (pattern.test(sTxt)) return "erorr";
  else return string;
};

const addToJson = (value, sTxt) => {
  const newCount = Object.keys(sTxt).length + 1;
  sTxt[newCount] = value;
};

const captureText = (elem, sTxt) => {
  if (
    elem.getAttribute("role") === "presentation" &&
    elem.tagName === "SPAN" &&
    elem.parentNode.tagName !== "SPAN"
  ) {
    const textContent = elem.textContent;
    addToJson(textContent, sTxt);
  }

  if (elem.hasChildNodes()) {
    elem.childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        captureText(childNode, sTxt);
      }
    });
  }
};

const downloadText = (text, fileName) => {
  // file-like object
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const filename = fileName;
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.download = filename;

  tempLink.click();
  URL.revokeObjectURL(url);
};

const findAssemblyCode = () => {
  const codeMirrorDiv = document.querySelector("#qasm_cm");
  if (!codeMirrorDiv) {
    const tab = Array.from(
      document.querySelectorAll(
        "div.tab-handle.disable-selection div.tab-handle-text"
      )
    ).find((element) => element.textContent.trim() === "Editor (Ctrl-E)");
    tab.click();
  }
};

const pasteAssemblyCode = (text, name) => {
  const file = name + ".s";
  var tempFile = {
    currentTarget: {
      value: file,
    },
    target: {
      files: [new File([text], file, { type: "text/plain" })],
      value: file,
    },
  };
  Zb(tempFile);
};
