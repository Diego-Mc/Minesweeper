'use strict'

const gHelpers = {
  HINT: { id: 'hint', amountLeft: 0 },
  MEGA_HINT: { id: 'mega-hint', amountLeft: 0, megaHintPositions: [] },
  SAFE_CLICK: {
    id: 'safe-click',
    amountLeft: 0,
    handler: () => handleSafeClick(gBoard),
  },
  EXTERMINATOR: {
    id: 'exterminator',
    amountLeft: 0,
    handler: handleExterminator,
    exterminateAmount: 3,
  },
}

function populateHelpers() {
  for (var buttonName in gHelpers) {
    resetAmountLeft(gHelpers[buttonName])
    updateAmountLeft(gHelpers[buttonName])
  }
}

function renderHelpersLeft() {
  for (var buttonName in gHelpers) {
    updateAmountLeft(gHelpers[buttonName])
  }
}

function disableHelpers() {
  for (var buttonName in gHelpers) {
    disableBtn(gHelpers[buttonName].id)
  }
}

function enableHelpers() {
  for (var buttonName in gHelpers) {
    if (gHelpers[buttonName].amountLeft <= 0) continue
    enableBtn(gHelpers[buttonName].id)
  }
}

var gHelperSelected = { id: '' }

function handleHelperBtn(elBtn) {
  handleButtonPress(elBtn, gHelperSelected, gHelpers)
}

function isHelperPressed(helper) {
  return gHelperSelected.id === helper.id
}

function resetSelectedHelper() {
  gHelperSelected = { id: '' }
}

function _getClassNameFromHelperType(helperType) {
  const parts = helperType.toLowerCase().split('_')
  parts[parts.length - 1] += 's'
  parts.push('left')
  return parts.join('-')
}

function _getHelperById(helperId) {
  for (var helperKey in gHelpers) {
    if (gHelpers[helperKey].id === helperId) return gHelpers[helperKey]
  }
  return null
}

//HANDLERS:
function handleExterminator() {
  const mineLocations = []

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) mineLocations.push({ i, j })
    }
  }

  mineLocations.sort(() => Math.random() - 0.5)

  for (var i = 0; i < gHelpers.EXTERMINATOR.exterminateAmount; i++) {
    if (mineLocations.length === 0) break
    const mineLoc = mineLocations.pop()
    if (gBoard[mineLoc.i][mineLoc.j].isMarked) cellMarked(mineLoc.i, mineLoc.j)
    removeMine(gBoard, mineLoc.i, mineLoc.j)
    gGame.cellsLeft++
  }
  updateAmountLeft(gHelpers.EXTERMINATOR, -1)
  unselectButton(gHelpers.EXTERMINATOR, gHelperSelected)
}

function handleMegaHintCellClick(i, j) {
  const megaHint = gHelpers.MEGA_HINT

  if (!megaHint.megaHintPositions) megaHint.megaHintPositions = []
  const positions = megaHint.megaHintPositions
  positions.push({ i, j })

  if (positions.length === 2) {
    _flashArea(...positions, 2000)
    megaHint.megaHintPositions = null
    updateAmountLeft(gHelpers.MEGA_HINT, -1)
    unselectButton(gHelpers.MEGA_HINT, gHelperSelected)
  }
}

function handleSafeClick(board) {
  const nonMineElements = getHiddenNonMineElements(board)
  const randIdx = getRandomInt(0, nonMineElements.length)
  const safeElement = nonMineElements[randIdx]

  if (!safeElement) return

  safeElement.classList.add('safe')

  setTimeout(() => safeElement.classList.remove('safe'), 2000)
  updateAmountLeft(gHelpers.SAFE_CLICK, -1)
  unselectButton(gHelpers.SAFE_CLICK, gHelperSelected)
}

function handleHintCellClick(i, j) {
  const startPos = { i: i - 1, j: j - 1 }
  const endPos = { i: i + 1, j: j + 1 }
  _flashArea(startPos, endPos, 1000)
  updateAmountLeft(gHelpers.HINT, -1)
  unselectButton(gHelpers.HINT, gHelperSelected)
}
