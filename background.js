const directory = "screenshots";
const format = "png";

chrome.runtime.onMessage.addListener((message) => {
  notify(message);
});

chrome.commands.onCommand.addListener(async (command) => {
  try {
    const base64 = await chrome.tabs.captureVisibleTab(null, { format });

    switch (command) {
      case "take-screenshot":
        await takeScreenshot(base64);
        return;
      case "save-screenshot":
        await saveScreenshot(base64);
        notify("Saved!");
        return;
      default:
        throw new Error(`unknown command: ${command}`);
    }
  } catch (err) {
    notify(`${err}`);
  }
});

const notify = (msg) => {
  chrome.notifications.create(null, {
    type: "basic",
    iconUrl: "/images/camera.png",
    title: "Screenshot",
    message: msg,
  });
};

const takeScreenshot = async (base64) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tabs[0].id, { base64 });
};

const saveScreenshot = async (base64) => {
  const downloadId = await download(base64);
  await wait(200);
  await clearDownloadItem(downloadId);
};

const download = async (url) => {
  const timestamp = getTimestamp();
  const filename = `${directory}/${timestamp}.${format}`;
  return await chrome.downloads.download({
    url,
    filename,
  });
};

const clearDownloadItem = async (id) => {
  await chrome.downloads.erase({ id });
};

const getTimestamp = () => {
  const dt = new Date();
  const year = dt.getFullYear();
  const month = pad(dt.getMonth() + 1, 2);
  const date = pad(dt.getDate(), 2);
  const hour = pad(dt.getHours(), 2);
  const min = pad(dt.getMinutes(), 2);
  const second = pad(dt.getSeconds(), 2);
  const msec = pad(dt.getMilliseconds(), 3);

  return [
    [year, month, date].join("-"),
    [hour, min, second].join("-"),
    msec,
  ].join("_");
};

const pad = (num, digit) => {
  return `0${num}`.slice(-digit);
};

const wait = (msec) => {
  return new Promise((resolve) => setTimeout(resolve, msec));
};
