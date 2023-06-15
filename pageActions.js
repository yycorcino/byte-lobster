window.addEventListener("message", function (event) {
  if (event.source === window) {
    if (event.data.type === "activateClearReg") {
      clearRegister();
    }

    if (event.data.type === "activateFindCodeMirror") {
      downloadText(getText());
    }

    if (event.data.type === "activateClearMem") {
      console.log("Clearing Memory Now!!");
    }

    if (event.data.type === "activateRefresh") {
      console.log("Activating Refresh");
    }

    if (event.data.type === "activateSettings") {
      console.log("Activating Settings");
    }
  }
});

const clearRegister = () => {
  registerList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  findRegElements();
  for (let i = 0; i < registerList.length; i++) {
    const registerVal = registerList[i];
    var targetReg = `#reg_value_r${registerVal} input`;
    var inputElement = document.querySelector(targetReg);

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

const findRegElements = () => {
  const registerBlock = document.querySelector("#reg_cm div.reg_block");
  if (!registerBlock) {
    const targetTab = Array.from(
      document.querySelectorAll(
        "div.tab-handle.disable-selection div.tab-handle-text"
      )
    ).find((element) => element.textContent.trim() === "Registers");
    targetTab.click();
  }
};

const getText = () => {
  findCode();

  let elem = document.querySelector("#qasm_cm div.CodeMirror-code");
  const sTxt = {};
  captureText(elem, sTxt);

  const valuesString = Object.values(sTxt)
    .filter((line) => line.trim().replace(/\u200B/g, ""))
    .join("\n");

  return valuesString;
};

const addToJSON = (value, sTxt) => {
  const newCount = Object.keys(sTxt).length + 1;
  sTxt[newCount] = value.trim();
};

const captureText = (elem, sTxt) => {
  if (elem.getAttribute("role") === "presentation" && elem.tagName === "SPAN") {
    const textContent = elem.textContent.trim();
    addToJSON(textContent, sTxt);
  }

  if (elem.hasChildNodes()) {
    elem.childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        captureText(childNode, sTxt);
      }
    });
  }
};

const downloadText = (valuesString) => {
  // file-like object
  const blob = new Blob([valuesString], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const filename = `assembly_${Date.now()}.txt`;
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.download = filename;

  tempLink.click();
  URL.revokeObjectURL(url);
};

const findCode = () => {
  const CodeMirror = document.querySelector("#qasm_cm");
  if (!CodeMirror) {
    const tab = Array.from(
      document.querySelectorAll(
        "div.tab-handle.disable-selection div.tab-handle-text"
      )
    ).find((element) => element.textContent.trim() === "Editor (Ctrl-E)");
    tab.click();
  }
};
