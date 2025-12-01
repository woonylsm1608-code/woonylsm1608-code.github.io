const fileInput = document.getElementById("file");
const dropZone = document.getElementById("drop-zone");
const result = document.getElementById("result");
const copyBtn = document.getElementById("copy");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "yellow";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#888";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#888";
  handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", () =>
  handleFile(fileInput.files[0])
);

async function handleFile(file) {
  if (file.type === "application/pdf") {
    const text = await processPDF(file);
    result.textContent = text;
  } else {
    const img = await preprocessImage(file);
    const text = await runOCR(img);
    result.textContent = text;
  }
}

/* PDF 처리 */
async function processPDF(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  let finalText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale: 2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    const text = await runOCR(canvas.toDataURL());
    finalText += `\n\n[Page ${i}]\n${text}`;
  }
  return finalText;
}

/* 전처리(흑백) */
async function preprocessImage(file) {
  const preprocess = document.getElementById("preprocess").checked;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!preprocess) return resolve(img);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;

      for (let i = 0; i < d.length; i += 4) {
        const v = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
        d[i] = d[i + 1] = d[i + 2] = v;
      }

      ctx.putImageData(data, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.src = URL.createObjectURL(file);
  });
}

/* OCR 실행 */
async function runOCR(src) {
  const langSelect = document.getElementById("lang").value;
  let lang = langSelect;

  if (langSelect === "auto") lang = "eng+kor";

  const { data: { text } } = await Tesseract.recognize(src, lang);
  return text;
}

/* 결과 복사 */
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(result.textContent);
});
