chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('sender = ', JSON.stringify(sender, null, 2))
    commandController(request)
  }
);

function commandController(request) {

  if (request.command && request.command === "openUrlNewTab") {
    openTab(request.payload)
    return
  }

  if (request.command && request.command === "shiftTab") {
    shiftTab(request.payload)
    return
  }

  if (request.command && request.command === "closeTab") {
    closeTab()
  }

}

function openTab(options) {
  const {url, active} = options
  chrome.tabs.create({ url, active }, (tab)=> {
  })
}

function shiftTab(options) {
  const {direction} = options
  const shift = direction === "next" ? 1 : -1

  function shiftTab (tabs) {

    let tabCount = tabs.length
    let activeTab

    for (let i = 0, len = tabCount; i < len; i++) {
      if (tabs[i].active) {
        activeTab = tabs[i]
      }
    }

    let targetIndex = 0
    if (activeTab.index + shift < 0) {
      targetIndex = tabCount - 1
    } else if (activeTab.index + shift > tabCount - 1) {
      targetIndex = 0
    } else {
      targetIndex = activeTab.index + shift
    }

    const targetID = tabs[targetIndex].id
    chrome.tabs.update(targetID, {
      active: true
    });
  }

  chrome.tabs.query({
    currentWindow: true,
  }, shiftTab)

}

function closeTab() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.remove(tab.id);
  });

}