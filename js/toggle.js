'use strict'

const gTOGGLERES = {
  HINT_MODE: 'hint-mode',
  MEGA_HINT_MODE: 'mega-hint-mode',
  MANUAL_MODE: 'manual-mode',
  BEGINNER: 'beginner',
  MEDIUM: 'medium',
  EXPERT: 'expert',
}
var gToggleOn = ''

function toggleManager(elBtn) {
  console.dir(elBtn)
  if (!gToggleOn) return routeToggle(elBtn.id)

  routeToggle(gToggleOn)
}

function routeToggle(toggleName) {
  switch (toggleName) {
    case 'hint-mode':
      if (gGame.hintsLeft !== 0) return toggleHintMode()
      break
    case 'mega-hint-mode':
      if (gGame.megaHintsLeft !== 0) return toggleMegaHintMode()
      break
    case 'manual-mode':
      if (!gGame.isManualEdit) initGame()
      return toggleManualMode()
    case 'beginner':
      return setLastSelectedDifficulty('beginner')
    case 'medium':
      return setLastSelectedDifficulty('medium')
    case 'expert':
      return setLastSelectedDifficulty('expert')
  }
}

function toggleHintMode() {
  gGame.hintMode = !gGame.hintMode //TODO: add visual indicator
}

function toggleMegaHintMode() {
  gGame.megaHintPositions = []
  gGame.megaHintMode = !gGame.megaHintMode
  //TODO: add visual indicator
}

function toggleManualMode() {
  gGame.isManualEdit = !gGame.isManualEdit

  if (gGame.isManualEdit) {
    const cellArgs = [false, true] //isMine, isShown
    gBoard = buildBoard(cellArgs)
    renderBoard(gBoard)
  } else {
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        gBoard[i][j].isShown = false
      }
    }
    renderBoard(gBoard)
    gGame.isManualMode = true
  }
}

function setLastSelectedDifficulty(levelStr) {
  localStorage.setItem('difficulty', levelStr)
  gLevel = copyObj(gLEVELS[levelStr])
  initGame()
}

function updateLastSelectedDifficulty() {
  const levelStr = localStorage.getItem('difficulty') || 'beginner'
  gLevel = copyObj(gLEVELS[levelStr])
}
