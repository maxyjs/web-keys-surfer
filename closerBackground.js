(function () {
    let contextMenuItem

    function runScriptByTabId(tabId, pageAlreadyLoaded) {
        chrome.tabs.get(tabId, function (tab) {
            const url = tab.url
            if (
                url.indexOf('chrome://') === 0 ||
                url.indexOf('chrome-devtools://') === 0 ||
                url.indexOf('view-source:') === 0
            ) {
                return
            }

            let limit = 40

            let timer = setInterval(interval, 1500)

            function interval() {
                limit -= 1

                if (limit <= 0) {
                    clearInterval(timer)
                }

                chrome.tabs.get(tabId, (tab) => {
                    if (tab) {
                        chrome.tabs.executeScript(tabId, {
                            allFrames: true,
                            runAt: pageAlreadyLoaded ? 'document_idle' : 'document_end',
                            file: "scripts/closerByMouse.js"
                        })
                    } else {
                        clearInterval(timer);
                    }
                })
            }

            interval()
        })
    }

    function runScript(tab, pageAlreadyLoaded) {
        runScriptByTabId(tab.id, pageAlreadyLoaded)
    }

    function closeTabByTabId(tabId) {
        chrome.tabs.remove(tabId)
    }

    function closeTab(tab) {
        closeTabByTabId(tab.id)
    }

    function removeContextMenuItem() {
        if (contextMenuItem) {
            chrome.contextMenus.remove(contextMenuItem)
        }
    }

    function addContextMenuItem() {
        removeContextMenuItem()

        contextMenuItem = chrome.contextMenus.create({
            title: 'Close Tab',
            contexts: ['all'],
            onclick: function (info, tab) {
                closeTab(tab)
            }
        })
    }

    function addContextMenuItemIfRequired(tabId) {
        chrome.tabs.get(tabId, function (tab) {
            const url = tab && tab.url

            if (url && tab.active) {
                chrome.windows.getLastFocused(function (win) {
                    if (tab.windowId === win.id) {
                        if (
                            url.indexOf('https://chrome.google.com/') === 0 ||
                            url.indexOf('view-source:') === 0
                        ) {
                            addContextMenuItem()
                        } else if (
                            url.indexOf('http://') === 0 ||
                            url.indexOf('https://') === 0 ||
                            url.indexOf('file:///') === 0 ||
                            url.indexOf('ftp:///') === 0
                        ) {
                            removeContextMenuItem()
                        } else {
                            addContextMenuItem()
                        }
                    }
                });
            }
        });
    }

    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            runScript(tab, true)
        })
    })

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        runScript(tab)

        addContextMenuItemIfRequired(tabId)
    });

    chrome.tabs.onReplaced.addListener(function (tabId, changeInfo, tab) {
        runScriptByTabId(tabId)
        removeContextMenuItem()
    });

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.closeTab) {
                closeTab(sender.tab)
            }
        }
    )

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        addContextMenuItemIfRequired(activeInfo.tabId)
    })

    chrome.windows.onFocusChanged.addListener(
        function (windowId) {
            if (windowId === chrome.windows.WINDOW_ID_NONE) {
            } else {
                chrome.windows.get(windowId, {populate: true}, function (win) {
                    const tabs = win.tabs
                    if (tabs) {
                        for (let i = 0; i < tabs.length; i += 1) {
                            const tab = tabs[i]
                            if (tab.active) {
                                addContextMenuItemIfRequired(tab.id)
                            }
                        }
                    }
                })
            }
        }
    )
}());
