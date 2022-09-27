'use strict'

const gDifficulties = {
  beginner: {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
    HINTS: 1,
    MEGA_HINTS: 1,
    SAFE_CLICKS: 1,
    EXTERMINATORS: 1,
  },
  medium: {
    SIZE: 8,
    MINES: 14,
    LIVES: 2,
    HINTS: 2,
    MEGA_HINTS: 2,
    SAFE_CLICKS: 2,
    EXTERMINATORS: 1,
  },
  expert: {
    SIZE: 12,
    MINES: 32,
    LIVES: 3,
    HINTS: 3,
    MEGA_HINTS: 3,
    SAFE_CLICKS: 3,
    EXTERMINATORS: 1,
  },
}

const gGameModes = {
  BEGINNER: {
    id: 'beginner',
    handler: () => setLastSelectedDifficulty(gGameModes.BEGINNER.id),
  },
  MEDIUM: {
    id: 'medium',
    handler: () => setLastSelectedDifficulty(gGameModes.MEDIUM.id),
  },
  EXPERT: {
    id: 'expert',
    handler: () => setLastSelectedDifficulty(gGameModes.EXPERT.id),
  },
  SEVEN_BOOM: { id: 'seven-boom', handler: handle7Boom },
  MANUAL: { id: 'manual', handler: handleManualMode },
}

var gGameModeSelected = { id: '' }

function handleGameModeBtn(elBtn) {
  handleButtonPress(elBtn, gGameModeSelected, gGameModes)
}

function isGameModePressed(gameMode) {
  return gGameModeSelected.id === gameMode.id
}

function resetSelectedGameMode() {
  gGameModeSelected = { id: '' }
}

//handlers:
function handle7Boom() {
  initGame()

  gGame.setMines = setMines7Boom
}

function handleManualMode() {
  console.log(isGameModePressed(gGameModes.MANUAL))
  if (isGameModePressed(gGameModes.MANUAL)) {
    resetGame()
    const cellArgs = [false, true] //isMine, isShown
    gBoard = buildBoard(cellArgs)
    renderBoard(gBoard)
    toggleSelectBtn(gGameModes.MANUAL.id) //visual effect
  } else {
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        gBoard[i][j].isShown = false
      }
    }
    renderBoard(gBoard)
    gGame.setMines = () => {}
  }
}

//TODO: bug fix in exterminator (not sure how to reproduce it yet..)

function setLastSelectedDifficulty(levelId) {
  localStorage.setItem('difficulty', levelId)
  gLevel = copyObj(gDifficulties[levelId])
  initGame()
}

function updateLastSelectedDifficulty() {
  var levelId = localStorage.getItem('difficulty') || 'beginner'
  gLevel = copyObj(gDifficulties[levelId])
  return levelId
}

function _getGameModeById(gameModeId) {
  for (var gameModeKey in gGameModes) {
    if (gGameModes[gameModeKey].id === gameModeId)
      return gGameModes[gameModeKey]
  }
  return null
}
