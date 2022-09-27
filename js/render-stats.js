'use strict'

const gMaxCount = 999

function renderBestRecord() {
  const recordQuery = `best-record-${gGame.difficulty}`
  const elBestRecord = document.querySelector('.best-record')
  const bestRecord = localStorage.getItem(recordQuery)

  if (!bestRecord) return (elBestRecord.innerText = '')

  const msg = `Best record [${gGame.difficulty}]: ${bestRecord} seconds.`

  elBestRecord.innerText = msg
}

function updateTime(startTime, delaySecs = 0) {
  const currTime = Date.now()
  const elapsed = currTime - startTime
  const secsElapsed = elapsed / 1000 + delaySecs

  gGame.secsPassed = parseInt(secsElapsed)
  if (gGame.secsPassed <= gMaxCount) renderTime(gGame.secsPassed)
  //still count towards best time but not update past MAX_TIME
}

function renderTime(secs = 0) {
  const timeSegments = getTimeSegments(secs)

  for (var segment in timeSegments) {
    const timer = document.querySelector(`#timer-${segment}`)
    const className = supportDark('count-')
    timer.className = `counter ${className}${timeSegments[segment]}`
  }
}

function getCountSegments(count) {
  const absCount = Math.abs(count)
  const segments = {}
  segments.hundreds = Math.floor(absCount / 100)
  segments.tens = Math.floor((absCount % 100) / 10)
  segments.ones = absCount % 10

  if (count < 0) segments.hundreds = 'minus' //display (-)
  return segments
}

function renderCount(count) {
  const countSegments = getCountSegments(count)

  for (var segment in countSegments) {
    const counter = document.querySelector(`#counter-${segment}`)
    const className = supportDark('count-')
    counter.className = `counter ${className}${countSegments[segment]}`
  }
}

function updateMarksLeft(diff = 0) {
  gGame.marksLeft += diff

  renderCount(gGame.marksLeft)
}

function updateLivesLeft(diff = 0) {
  gGame.livesLeft += diff

  const elPropCounter = document.querySelector(`.lives-left`)

  const fileName = `<img src="sprites/stats-icons/life`
  const lifeSymbolLeft = `${fileName}.png"/>`
  const lifeSymbolUsed = `${fileName}_used.png"/>`

  const livesLeft = gGame.livesLeft
  const livesUsed = gLevel.LIVES - livesLeft
  const livesLeftStr = lifeSymbolLeft.repeat(livesLeft)
  const livesUsedStr = lifeSymbolUsed.repeat(livesUsed)

  elPropCounter.innerHTML = livesLeftStr + livesUsedStr
}

function updateAmountLeft(button, diff = 0) {
  button.amountLeft += diff

  const amountLeftClass = _getAmountLeftClassFromBtnId(button.id)
  const gLevelPropertyName = _getGLevelPropertyNameFromBtnId(button.id)

  const elPropCounter = document.querySelector(`.${amountLeftClass}`)

  const amountLeft = button.amountLeft
  const amountUsed = gLevel[gLevelPropertyName] - amountLeft

  const startingStrHTML = `<img src="sprites/stats-icons/`
  const fileName = supportDarkFile(button.id)
  const symbolLeft = `${startingStrHTML + fileName}.png"/>`
  const symbolUsed = `${startingStrHTML + fileName}_used.png"/>`

  const amountLeftStr = symbolLeft.repeat(amountLeft)
  const amountUsedStr = symbolUsed.repeat(amountUsed)

  elPropCounter.innerHTML = amountLeftStr + amountUsedStr
}

function updateEmoji(type) {
  const elEmojiBtn = document.querySelector('.emoji')
  const className = supportDark(gEmoji[type])
  elEmojiBtn.className = `emoji ${className}`
  //Add scared emoji call
}

function resetAmountLeft(button) {
  const gLevelPropertyName = _getGLevelPropertyNameFromBtnId(button.id)
  const levelAmount = gLevel[gLevelPropertyName]
  button.amountLeft = levelAmount
}

function _getAmountLeftClassFromBtnId(buttonId) {
  return buttonId + `s-left`
}

function _getGLevelPropertyNameFromBtnId(buttonId) {
  const parts = buttonId.toUpperCase().split('-')
  parts[parts.length - 1] += 'S'
  return parts.join('_')
}
