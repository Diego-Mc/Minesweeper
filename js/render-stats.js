'use strict'

function renderBestRecord() {
  const elBestRecord = document.querySelector('.best-record')
  const bestRecord = localStorage.getItem('best-record') || '?'

  elBestRecord.innerText = bestRecord
}

function updateMarksLeft(diff = 0) {
  gGame.marksLeft += diff

  // const elPropCounter = document.querySelector(`.${'marks-left'}`)
  // elPropCounter.innerText = gGame['marksLeft']

  if (gGame.marksLeft >= 0) renderCount(gGame.marksLeft)
}

function updateSafeClicksLeft(diff = 0) {
  //TODO: move to toggle and change
  gGame.safeClicksLeft += diff

  const elPropCounter = document.querySelector(`.safe-clicks-left`)

  var strHTML = ''
  for (var i = 0; i < gGame.safeClicksLeft; i++) {
    strHTML += gClasses.SAFE_CLICK
  }

  elPropCounter.innerText = strHTML
}

function updateLivesLeft(diff = 0) {
  gGame.livesLeft += diff

  const elPropCounter = document.querySelector(`.lives-left`)

  var strHTML = ''
  for (var i = 0; i < gGame.livesLeft; i++) {
    strHTML += gClasses.LIFE
  }

  elPropCounter.innerText = strHTML
}

function updateHintsLeft(diff = 0) {
  gTogglers.HINT_MODE.amountLeft += diff

  const elPropCounter = document.querySelector(`.hints-left`)

  var strHTML = ''
  for (var i = 0; i < gTogglers.HINT_MODE.amountLeft; i++) {
    strHTML += gClasses.HINT
  }

  elPropCounter.innerText = strHTML
}

function updateMegaHintsLeft(diff = 0) {
  gTogglers.MEGA_HINT_MODE.amountLeft += diff

  const elPropCounter = document.querySelector(`.mega-hints-left`)

  var strHTML = ''
  for (var i = 0; i < gTogglers.MEGA_HINT_MODE.amountLeft; i++) {
    strHTML += gClasses.MEGA_HINT
  }

  elPropCounter.innerText = strHTML
}

function _updateGlobalPropertyLeft(propName, className, diff) {
  //to be removed
  gGame[propName] += diff

  const elPropCounter = document.querySelector(`.${className}`)
  elPropCounter.innerText = gGame[propName]
}
