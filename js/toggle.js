'use strict'

function toggleManager(elBtn) {
  console.dir(elBtn)

  //TODO: instanly turn disabled when 0 (not like now..)

  switch (elBtn.id) {
    case 'hint-mode':
      if (gGame.hintsLeft !== 0) return toggleHintMode()
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

  //ADD DISABLED ATTR

  //difficulties

  //undo-btn - undoMove() //NOT TOGGLE

  //safe-click - handleSafeClick() //NOT TOGGLE

  //use-manual - toggleManualMode()

  //use-hint - toggleHintMode()
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
