async function onAlarm(alarm) {
  console.debug(`alarm::${alarm.name}`);
  let data = await getDataFromStorage(alarm.name);
  console.debug(data);
  window.open(data.link, "_blank");
  // logic to open url and then do some stuff with page
}

async function getAllDataFromStorage() {
  return await new Promise((resolve) => {
    chrome.storage.sync.get(null, (result) => resolve(result || {}));
  });
}

async function getDataFromStorage(key) {
  return await new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => resolve(result[key]));
  });
}

async function receiveMessage(request, sender) {
  // all request from extension
  console.debug(`message::key=${request.key}`);
  if (!sender.tab) {
    if (request.type == "ADD_ALARM") {
      console.debug("message::add alarm");
      // get data from storage
      let data = await getDataFromStorage(request.key);
      // create alarm
      chrome.alarms.create(request.key, {
        when: data.time,
        periodInMinutes: 10080,
      });
    } else if (request.type == "REMOVE_ALARM") {
      console.debug("message::alarm remove");
      // remove alarm
      await new Promise((resolve) => chrome.alarms.clear(request.key, resolve));
      // remove data from storage
      
    } else if (request.type == "REMOVE_ALL_ALARM") {
      // clear all alarm
      await new Promise23();
      2((resolve) => chrome.alarms.clearAll(resolve));
      // clear all storage
      await new Promise((resolve) => chrome.storage.sync.clear(resolve));
    }
  }
}

async function syncAlarms() {
  let data = await getAllDataFromStorage();

  // remove all alarms that are not in storage
  let alarms = await new Promise((resolve) => chrome.alarms.getAll(resolve));
  for (let i = 0; i < alarms.length; i++) {
    if (alarms[i].name in data) {
    } else {
      await new Promise((resolve) =>
        chrome.alarms.clear(alarms[i].name, resolve)
      );
      console.debug(`alarm-sync::${alarms[i].name} alarm removed`);
    }
  }

  // set alarms that are in storage but not scheduled yet
  for (var key in data) {
    let alarm = await new Promise((resolve) => chrome.alarms.get(key, resolve));
    if (alarm == undefined) {
      console.debug(`alarm-sync::${key} alarms scheduled weekly`);
      chrome.alarms.create(key, {
        when: data[key].time,
        periodInMinutes: 10080,
      });
    }
  }
}

function onStart() {
  console.debug("extension:started");
  console.debug(`time::${Date.now()}`);
  syncAlarms();
}

function onInstallation() {
  console.debug("extension::installed");
  onStart();
}

// on install
chrome.runtime.onInstalled.addListener(onInstallation);

// on startup
chrome.runtime.onStartup.addListener(onStart);

// on alarm event listner
chrome.alarms.onAlarm.addListener(onAlarm);

// on message receive
chrome.runtime.onMessage.addListener(receiveMessage);
