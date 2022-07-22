chrome.runtime.onMessage.addListener(async (message) => {
  try {
    const blob = toBlob(message.base64);
    await writeClipboard(blob);
    notify("Written Clipboard");
  } catch (err) {
    notify(`${err}`);
  }
});

const toBlob = (base64) => {
  const type = base64.match(/^data:(.+);/)[1];
  const bin = atob(base64.replace(/^.+,/, ""));
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  return new Blob([buffer.buffer], {
    type,
  });
};

const writeClipboard = async (blob) => {
  const data = [new ClipboardItem({ [blob.type]: blob })];
  await navigator.clipboard.write(data);
};

const notify = async (msg) => {
  await chrome.runtime.sendMessage(null, msg);
};
