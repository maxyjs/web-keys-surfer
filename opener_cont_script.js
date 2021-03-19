;(function start() {

  const extOptions = {
    scrollByPx: 1000,
    numOpenResults: 6,
    openLinksStartDelay: 3000,
    searchEnginesSettings: [
      {
        name: 'googleSearchOpener',
        active: true,
        activatePattern: 'https://www.google.(ru|com)/search',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '#search',
          resultElemSelector: '.g',
          resultLinkSelector: 'a',
        }
      },
      {
        name: 'yandexSearchOpener',
        active: true,
        activatePattern: 'https://yandex.ru/search/?',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '#search-result',
          resultElemSelector: '#search-result > li.serp-item',
          resultLinkSelector: 'a'
        }
      },
      {
        name: 'youTubeSearchOpener',
        active: true,
        activatePattern: 'https://www.youtube.com/results?',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '#contents',
          resultElemSelector: 'ytd-video-renderer.style-scope.ytd-item-section-renderer',
          resultLinkSelector: 'a'
        }
      },
      {
        name: 'youTubePlaylist',
        active: true,
        activatePattern: 'https://www.youtube.com/playlist?',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '#contents.style-scope.ytd-playlist-video-list-renderer',
          resultElemSelector: 'ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer',
          resultLinkSelector: '#video-title'
        }
      },
      {
        name: 'stackoverflowSearchOpener',
        active: true,
        activatePattern: 'https://stackoverflow.com/search?',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '.js-search-results > div',
          resultElemSelector: '.search-result',
          resultLinkSelector: 'h3 > a'
        }
      },
      {
        name: 'ru_stackoverflowSearchOpener',
        active: true,
        activatePattern: 'https://ru.stackoverflow.com/search?',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '.flush-left.js-search-results',
          resultElemSelector: '.search-result',
          resultLinkSelector: 'h3 > a'
        }
      },
      {
        name: 'githubRepositoriesSearchOpener',
        active: true,
        activatePattern: 'https://github.com/search?.*type=repositories',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '.repo-list',
          resultElemSelector: '.repo-list-item',
          resultLinkSelector: '.f4 > a'
        }
      },
      {
        name: 'githubCodeSearchOpener',
        active: true,
        activatePattern: 'https://github.com/search?.*type=code',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '.code-list',
          resultElemSelector: '.hx_hit-code',
          resultLinkSelector: '.f4 > a'
        }
      },
      {
        name: 'hhVacancySearchOpener',
        active: true,
        activatePattern: 'https://hh.ru/search/vacancy',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: '.vacancy-serp',
          resultElemSelector: '.vacancy-serp-item',
          resultLinkSelector: '.g-user-content > a'
        }
      },
      {
        name: 'raindropSearchOpener',
        active: true,
        activatePattern: 'https://app.raindrop.io/my',
        iterableClass: 'iter1',
        SELECTORS: {
          resultsContainerSelector: 'main:not(.svMain)',
          resultElemSelector: '.height-2V2t',
          resultLinkSelector: 'article > a'
        }
      },
    ]
  }

  const isDev = true

  launch(extOptions)

  function launch(extOptions) {
    if (isDev !== true) {
      opener_cont_script(extOptions)
    } else {
      try {
        opener_cont_script(extOptions)
      } catch (err) {
        const message = `
          Error [ opener_cont_script ]
          ${err.message || ''}
          `
        alert(message)
      }
    }
  }
})()

function opener_cont_script(extOptions) {

  setKeys(extOptions, setKeysSearchEngines, setKeysUndefinedPages)

  function setKeys(extOptions, setKeysSearchEngines, setKeysUndefinedPages) {

    const {searchEnginesSettings} = extOptions

    const currentUrl = window.location.href

    for (const candidate of searchEnginesSettings) {
      const regex = new RegExp(candidate.activatePattern, 'i')
      const match = regex.test(currentUrl)

      if (match && candidate.active) {
        return setKeysSearchEngines(candidate, extOptions)
      }
    }

    setKeysUndefinedPages(extOptions)
  }
}

function setKeysSearchEngines(engineSettings, extOptions) {
  setCtrlAllow_SE(engineSettings, extOptions)
  setShiftAllow_SE(engineSettings, extOptions)

  function setCtrlAllow_SE(engineSettings, extOptions) {

    const {
      SELECTORS
    } = engineSettings

    const multiOpenOpts = {
      numOpenResults: extOptions.numOpenResults,
      openLinksStartDelay: extOptions.openLinksStartDelay
    }

    window.Mousetrap.bind('ctrl+up', function (e) {
      openFewResults(SELECTORS, multiOpenOpts)
      return false;
    });

    window.Mousetrap.bind('ctrl+right', function (e) {
      openFirstResultNewTab(SELECTORS)
      return false;
    });

    window.Mousetrap.bind('ctrl+down', function (e) {
      openFirstResultInActiveTab(SELECTORS)
      return false;
    });

    window.Mousetrap.bind('ctrl+left', function (e) {
      removeFirstResultElem(SELECTORS)
      return false;
    });
  }

  function setShiftAllow_SE(engineSettings, extOptions) {

    const {
      SELECTORS
    } = engineSettings

    window.Mousetrap.bind('shift+right', function (e) {
      goToNextTab()
      return false;
    });

    window.Mousetrap.bind('shift+left', function (e) {
      goToPrevTab()
      return false;
    });
  }

  /***   Actions Search Pages  ***/
  function openFewResults(SELECTORS, multiOpenOpts) {
    openFirstResultInActiveTab(SELECTORS)

    let {
      openLinksStartDelay,
      numOpenResults: conter
    } = multiOpenOpts

    conter = conter - 1

    while(conter) {
      setTimeout( () => {
        openFirstResultNewTab(SELECTORS)
      } , conter * openLinksStartDelay )
      conter--
    }
  }

  function openFirstResultNewTab(SELECTORS) {

    const data = getDataForOpen(SELECTORS)
    if (data.error) {
      console.error(data.reason)
      return
    }

    openUrlInNewTab(data.url, {active: false})
    data.resultElem.remove()

  }

  function openFirstResultInActiveTab(SELECTORS) {
    const data = getDataForOpen(SELECTORS)
    if (data.error) {
      console.error(data.reason)
      return
    }

    openUrlInNewTab(data.url, {active: true})
    data.resultElem.remove()
  }

  function removeFirstResultElem(SELECTORS) {
    const data = getDataForOpen(SELECTORS)
    if (data.error) {
      console.error(data.reason)
      return
    }
    data.resultElem.remove()
  }
  // actions-search-pages
  /***   Helpers Search Pages  ***/
  function openUrlInNewTab(url, options = {}) {

    const {
      active = true
    } = options

    chrome.runtime.sendMessage(
      {
        command: 'openUrlNewTab',
        payload: {
          url,
          active
        }
      },
      () => {
      }
    )
  }

  function getDataForOpen(SELECTORS) {

    const {
      resultsContainerSelector,
      resultElemSelector,
      resultLinkSelector
    } = SELECTORS

    try {
      const resultElem = getElementBySelector(resultElemSelector, resultsContainerSelector)
      const linkElem = getElementBySelector(resultLinkSelector, resultElem)
      const url = linkElem.href

      return {
        error: false,
        resultElem,
        url
      }

    } catch (err) {
      return {
        error: true,
        reason: err
      }
    }
  }
  // helpers-search-pages
}

function setKeysUndefinedPages(extOptions) {
  setCtrlAllow(extOptions)
  setShiftlAllow(extOptions)

  function setCtrlAllow(extOptions) {

    const {scrollByPx} = extOptions

    window.Mousetrap.bind('ctrl+up', function (e) {
      window.scrollBy(0,-scrollByPx);
      return false;
    });

    window.Mousetrap.bind('ctrl+right', function (e) {
      closeTab()
      return false;
    });

    window.Mousetrap.bind('ctrl+down', function (e) {
      window.scrollBy(0, scrollByPx);
      return false;
    });

    window.Mousetrap.bind('ctrl+left', function (e) {
      goToNextTab()
      return false;
    });
  }

  function setShiftlAllow(extOptions) {

    window.Mousetrap.bind('shift+right', function (e) {
      goToNextTab()
      return false;
    });

    window.Mousetrap.bind('shift+left', function (e) {
      goToPrevTab()
      return false;
    });
  }
}

function closeTab() {
  chrome.runtime.sendMessage(
    {
      command: 'closeTab',
    },
    () => {  }
  );
}

function goToNextTab() {
  chrome.runtime.sendMessage(
    {
      command: 'shiftTab',
      payload: {
        direction: "next"
      }
    },
    () => {  }
  );
}

function goToPrevTab() {
  chrome.runtime.sendMessage(
    {
      command: 'shiftTab',
      payload: {
        direction: "prev"
      }
    },
    () => {  }
  );
}

function getElementBySelector(selector, context) {

  const extensionName = '[web keys surfer]'

  let contextElem

  if (isElement(context)) {
    contextElem = context
  } else {
    contextElem = document.querySelector(context)
    if (!contextElem) {
      console.error(`
        ${extensionName}
        Not found context by selector: ${contextElem}`)
      return null
    }
  }

  const element = contextElem.querySelector(selector)
  if (!element) {
    console.error(`
        ${extensionName}
        Not found element by selector: ${selector}
        Context:`)
    console.error(contextElem)
    return null
  }

  return element

  function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
  }

}