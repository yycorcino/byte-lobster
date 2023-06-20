window.addEventListener("message", function (event) {
  if (event.source === window) {
    if (event.data.type === "activateClearReg") {
      findRegisterDiv();
      clearRegister();
    }

    if (event.data.type === "activateDownloadCode") {
      findAssemblyCode();
      const targetAssemblyCode = jsonToString(generateJsonString());
      downloadText(targetAssemblyCode, event.data.fileName);
    }

    if (event.data.type === "activateRefresh") {
      // sends to contentScripts.js
      window.postMessage(
        { type: "storeAssemblyCode", data: generateJsonString() },
        "*"
      );

      location.reload();
    }

    if (event.data.type === "pasteAssemblyCode") {
      pasteAssemblyCode(jsonToString(event.data.data));
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

      if (inputElement.Ea) {
        var b = H[inputElement.D[0]][inputElement.D[1]];
        var a = b[2] & 15;
        var c = ra(a);
        b = b[1];
        a =
          1 == a || 2 == a
            ? xb(inputElement.value, c, 6)
            : xb(inputElement.value, c);
        if (3 == c) {
          x(8, [b, a.qa]);
          x(8, [b + 1, a.pa]);
        } else {
          x(8, [b, a]);
        }
        inputElement.classList.remove("editing");
        x(6);
        inputElement.Ea = !1;
      }
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

const generateJsonString = () => {
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

const pasteAssemblyCode = (text) => {
  var tempFile = {
    currentTarget: {
      value: "refresh.s",
    },
    target: {
      files: [new File([text], "refresh.s", { type: "text/plain" })],
      value: "refresh.s",
    },
  };
  Zb(tempFile);
};
