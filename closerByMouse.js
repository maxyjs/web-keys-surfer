if (window.closerByMouse === undefined) {
  const recieveRightClick = (function () {
    let counter = 0
    let lastTime = new Date()
    let tabRemoveAlreadyRequested = false

    return function (e) {
      if (e.which !== 3) {
        return
      }

      counter++
      setTimeout( () => {
        if (counter) {
          counter--
        }
      }, 500)

      let thisTime = new Date()
      let timeDiff = thisTime - lastTime
      lastTime = thisTime

      if ((counter === 2 && timeDiff >= 50) || counter > 2) {
        if (!tabRemoveAlreadyRequested) {
          tabRemoveAlreadyRequested = true
          chrome.runtime.sendMessage({closeTab: true})
        }
      }
    }
  }());

  const interval = setInterval(function () {
    if (document.body) {
      document.onmouseup = function (e) {
        recieveRightClick(e);
      }
    }

    clearInterval(interval)
  }, 100)

  window.closerByMouse = true
}
