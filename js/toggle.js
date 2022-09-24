'use strict'

const gTogglers = {
  HINT_MODE: { id: 'hint-mode', amountLeft: 0 },
  MEGA_HINT_MODE: { id: 'mega-hint-mode', amountLeft: 0 },
  MANUAL_MODE: { id: 'manual-mode', amountLeft: 0 },
}

const gDifficulties = {
  BEGINNER: { id: 'beginner' },
  MEDIUM: { id: 'medium' },
  EXPERT: { id: 'expert' },
}

function populateTogglers() {
  gTogglers.HINT_MODE.amountLeft = gLevel.HINTS
  gTogglers.MEGA_HINT_MODE.amountLeft = gLevel.MEGA_HINTS
  gTogglers.MANUAL_MODE.amountLeft = 1
}

function isToggled(toggle) {
  return gCurrToggle && gCurrToggle.id === toggle.id
}

function startHintMode() {
  //setup
  gCurrToggle = gTogglers.HINT_MODE
}

function endHintMode() {
  updateHintsLeft(-1)

  //end
  if (gCurrToggle.amountLeft === 0) return blockToggle(gCurrToggle.id)
  gCurrToggle = null
}

function startMegaHintMode() {
  gGame.megaHintPositions = []

  //setup
  gCurrToggle = gTogglers.MEGA_HINT_MODE
}

function endMegaHintMode() {
  gGame.megaHintPositions = []
  updateMegaHintsLeft(-1)

  //end
  if (gCurrToggle.amountLeft === 0) return blockToggle(gCurrToggle.id)
  gCurrToggle = null
}

function blockToggle(toggleId) {
  console.log('blockToggle', toggleId)
  const elBtn = document.querySelector(`#${toggleId}`)
  elBtn.disabled = true
}

//TODO: fix firstMove working differently for manual mode!
//TODO: also, fix - don't allow the toggle start to run if its the first move: make the toggle functions empty on start, and have the first move generate their values. if in manual mode add into manual mode the generation of them

function startManualMode() {
  initGame()

  const cellArgs = [false, true] //isMine, isShown
  gBoard = buildBoard(cellArgs)
  renderBoard(gBoard)

  //setup
  gCurrToggle = gTogglers.MANUAL_MODE
}

function endManualMode() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      gBoard[i][j].isShown = false
    }
  }
  renderBoard(gBoard)
  gGame.setMines = () => {}

  //end
  gCurrToggle = null
}

var gCurrToggle = null

function toggleManager(elBtn) {
  const toggleId = elBtn.id

  if (gCurrToggle && gCurrToggle.id === toggleId) {
    endToggle(toggleId)
  } else {
    gCurrToggle = gTogglers[toggleId]
    startToggle(toggleId)
  }
}

//TODO: combine toggleManager and startToggle and endToggle to one function, it will do a switch and then have the if statements of toggleManager to see what needs to be done

function getToggleById(toggleId) {
  for (var toggleKey in gTogglers) {
    if (gTogglers[toggleKey].id === toggleId) return gTogglers[toggleKey]
  }
  return null
}

//TODO!! - Prevent users from clicking on the buttons when a condition is met

//TODO:!!!!!!!!!! fix bug!! start/end mega hint functions do the same thing toggle manager does WITHOUT checking if there are hints left. I plan to block the user from even trying this but I need to implement it and make sure it works.
//also, based on said^ the function start/end mega hint are redundant, think about it...
//also, think about the concept of even handling start and end toggles, maybe there is a better way without repeating myself... (and maybe there isn't)

function startToggle(toggleId) {
  switch (toggleId) {
    case 'hint-mode':
      return startHintMode()
      break
    case 'mega-hint-mode':
      return startMegaHintMode()
      break
    case 'manual-mode':
      return startManualMode()
    case 'beginner':
      return setLastSelectedDifficulty('beginner')
    case 'medium':
      return setLastSelectedDifficulty('medium')
    case 'expert':
      return setLastSelectedDifficulty('expert')
  }
}

function endToggle(toggleId) {
  console.log('endToggle', toggleId)

  switch (toggleId) {
    case 'hint-mode':
      endHintMode()
      break
    case 'mega-hint-mode':
      endMegaHintMode()
      break
    case 'manual-mode':
      return endManualMode()
    case 'beginner':
      return setLastSelectedDifficulty('beginner')
    case 'medium':
      return setLastSelectedDifficulty('medium')
    case 'expert':
      return setLastSelectedDifficulty('expert')
  }
}

//TODO: create startToggle and stopToggle - these will call respective functions to handle either the function that runs after hitting the toggle or the function that runs after stopping the toggle respectively.
//meaning //TODO: break up handlers to start and end functions

function setLastSelectedDifficulty(levelStr) {
  localStorage.setItem('difficulty', levelStr)
  gLevel = copyObj(gLEVELS[levelStr])
  initGame()
}

function updateLastSelectedDifficulty() {
  const levelStr = localStorage.getItem('difficulty') || 'beginner'
  gLevel = copyObj(gLEVELS[levelStr])
}

//TODO: leaderboard for each level

//TODO: add safe click toggle

//IDEA: save a global variable that indicates the current toggle button pressed (most recent), if an unexpected button is pressed then run the recent toggle button again to clear it first. then proceed to run the unexpected button that was pressed. (this will solve the problem where for example you can press hint then press safe click and it will hint on top of the safe click (where it should have cancelled the hint if the user decided to use safe click instead))

//toggler toggles the state on/off AND the global variable indicateing the current toggle
//handler should do the action that the toggle indicates
//the toggle manager should connect the toggle state with the handler

//NOTE: this should be used together with the mouseEventsManager - maybe even unite them.. (or maybe not)
