'use strict'

var gBoard = []

var gLevel = {
  SIZE: 7,
  MINES: 6,
  LIVES: 3,
  HINTS: 3,
  SAFE_CLICKS: 3,
}

const gLEVELS = {
  beginner: {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
    HINTS: 1,
    SAFE_CLICKS: 1,
  },
  medium: {
    SIZE: 8,
    MINES: 14,
    LIVES: 2,
    HINTS: 2,
    SAFE_CLICKS: 2,
  },
  expert: {
    SIZE: 12,
    MINES: 32,
    LIVES: 3,
    HINTS: 3,
    SAFE_CLICKS: 3,
  },
}

var gGame = {
  isOn: true,
  marksLeft: 0,
  secsPassed: 0,
  cellsShown: 0,
  livesLeft: 0,
  timerInterval: 0,
  hintMode: false,
  hintsLeft: 0,
  safeClicksLeft: 0,
  isOverMarked: false,
  MAX_TIME: 999,
  isManualMode: false,
  isManualEdit: false,
  minesMarkStatus: {},
  HINT_FLASH_TIME: 1000,
  megaHintMode: false,
  megaHintPositions: {},
}

var gHistory = (gHistory = {
  gBoards: [],
  marksLeft: [],
  livesLeft: [],
})

var gClasses = {
  EMOJI: {
    HAPPY: 'emoji-happy',
    DEAD: 'emoji-death',
    COOL: 'emoji-cool',
    SCARED: 'emoji-scared',
  },
  LIFE: '❤️',
  HINT: '💡',
}

function toggleHintMode() {
  gGame.hintMode = !gGame.hintMode //TODO: add visual indicator
}

function setMinesAmount(minesAmount) {
  gLevel.MINES = minesAmount
}

function initGame() {
  gameOver() //TODO: change to reset function instead?

  gGame.isManualMode || updateLastSelectedDifficulty()

  gBoard = buildBoard()
  gHistory = {
    gBoards: [],
    marksLeft: [],
    livesLeft: [],
    cellsShown: [],
  }

  gGame.minesMarkStatus = {}

  gGame.marksLeft = 0
  updateMarksLeft()

  gGame.livesLeft = gLevel.LIVES
  updateLivesLeft()

  gGame.hintsLeft = gLevel.LIVES
  updateHintsLeft()

  gGame.safeClicksLeft = gLevel.SAFE_CLICKS
  updateSafeClicksLeft()

  updateEmoji('HAPPY')

  gGame.cellsShown = 0
  gGame.isOn = true
  gGame.hintMode = false
  gGame.megaHintMode = false
  gGame.megaHintPositions = {}
  gGame.isManualMode = false
  gGame.isManualEdit = false
  gGame.isOverMarked = false
  gGame.timerInterval = 0
  gGame.secsPassed = 0
  gGame.setMines = setMinesRandomly
  renderTime(0)

  renderBestRecord()

  renderBoard(gBoard)
}

function undoMove() {
  if (!gGame.isOn) return
  if (gHistory.gBoards.length === 0) return
  gBoard = gHistory.gBoards.pop()
  gGame.livesLeft = gHistory.livesLeft.pop()
  gGame.marksLeft = gHistory.marksLeft.pop()
  gGame.cellsShown = gHistory.cellsShown.pop()

  renderBoard(gBoard)
  updateLivesLeft()
  updateMarksLeft()
  updateEmoji('HAPPY')
}

function gameOver(didWin) {
  clearInterval(gGame.timerInterval)
  gGame.timerInterval = 0
  gGame.isOn = false
  gGame.isManualMode = false
  updateEmoji(didWin ? 'COOL' : 'DEAD')

  if (didWin) {
    const shortestTime = localStorage.getItem('best-record')
    const isNewRecord = !shortestTime || gGame.secsPassed < shortestTime

    if (isNewRecord) localStorage.setItem('best-record', gGame.secsPassed)
  }
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

function setMines7Boom(board = gBoard) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cellIdx = i * gLevel.SIZE + j

      if (cellIdx % 7 === 0 || (cellIdx + '').includes('7'))
        addMine(board, i, j)
    }
  }
}

function handle7Boom() {
  initGame()

  gGame.setMines = setMines7Boom
}

//TODO: mega hint button, after click you can select top-left & bottom-right corners of area you want to see for 2sec
//TODO: mine exterminator buddy - will remove 3 random mines

//TODO: dark mode
//TODO: render mine that killed you
//TODO: render wrong marks
//TODO: render scared emoji

function pushToHistory() {
  gHistory.gBoards.push(copyObj(gBoard))
  gHistory.livesLeft.push(gGame.livesLeft)
  gHistory.marksLeft.push(gGame.marksLeft)
  gHistory.cellsShown.push(gGame.cellsShown)
}

function cellClicked(i, j) {
  const currCell = gBoard[i][j]

  if (!isClickable(currCell)) return

  pushToHistory()

  currCell.isShown = true
  renderCell(gBoard, i, j)

  if (currCell.isMine) {
    if (!gGame.marksLeft) {
      handleOverMarked()
      gGame.isOverMarked = true
    }
    updateLivesLeft(-1)
    updateMarksLeft(-1)
    if (gGame.livesLeft === 0) return gameOver(false)
    return
  }

  gGame.cellsShown++

  if (currCell.negMinesCount === 0) expandShown(gBoard, i, j)

  checkVictory()
}

function cellMarked(i, j) {
  const currCell = gBoard[i][j]
  const cantMark = !currCell.isMarked && gGame.marksLeft <= 0

  if (currCell.isShown || cantMark) return

  pushToHistory()

  currCell.isMarked = !currCell.isMarked

  if (gGame.minesMarkStatus.hasOwnProperty(`mine-${i}-${j}`)) {
    gGame.minesMarkStatus[`mine-${i}-${j}`] = currCell.isMarked
  }

  renderCell(gBoard, i, j)

  updateMarksLeft(currCell.isMarked ? -1 : +1)

  if (gGame.isOverMarked) {
    handleOverMarked()
    gGame.isOverMarked = false
  }

  checkVictory()
}

function areAllMinesMarked() {
  for (var mine in gGame.minesMarkStatus) {
    if (!gGame.minesMarkStatus[mine]) return false
  }
  return true
}

//TODO:!!! set a data structure to track if a marked cell is a correct mark, using this we can evaluate marked correctly cells to actual cells and check for win & also ESPECIALLY not rely on gLevel as the actual mines counter, gLevel should only be used to generate a board using default settings, when creating special boards/dynamic boards we should use the actual mines placement as the single source of truth for this matter. !!!//TODO

function setMinesRandomly(board = gBoard) {
  var minesCount = gLevel.MINES
  const possiblesCoords = []

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      possiblesCoords.push({ i, j })
    }
  }

  possiblesCoords.sort(() => Math.random() - 0.5)

  for (var i = 0; i < possiblesCoords.length; i++) {
    const posI = possiblesCoords[i].i
    const posJ = possiblesCoords[i].j

    if (board[posI][posJ].isShown) continue
    addMine(board, posI, posJ)
    minesCount--
    if (minesCount === 0) return
  }
}

//RENDERERS:

function renderSafeClick(board) {
  const nonMineElements = getHiddenNonMineElements(board)
  const randIdx = getRandomInt(0, nonMineElements.length)
  const safeElement = nonMineElements[randIdx]

  if (!safeElement) return

  safeElement.classList.add('safe')

  setTimeout(() => safeElement.classList.remove('safe'), 2000)
}

function renderBoard(board) {
  var elGameBoard = document.querySelector('.game-board')
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      const classes = getCssClasses(board, i, j)
      const events = `onmouseup="handleClick(event,this,${i},${j})"`
      strHTML += `<td ${events} class="${classes}" id="cell-${i}-${j}"></td>`
    }
    strHTML += '</tr>'
  }
  elGameBoard.innerHTML = strHTML
}

function renderBestRecord() {
  const elBestRecord = document.querySelector('.best-record')
  const bestRecord = localStorage.getItem('best-record') || '?'

  elBestRecord.innerText = bestRecord
}

//HANDLERS
function handleSafeClick() {
  if (isFirstMove()) return

  if (gGame.safeClicksLeft === 0) return

  updateSafeClicksLeft(-1)
  renderSafeClick(gBoard)
}

function handleClick(ev, elCell, i, j) {
  if (!gGame.isOn) return
  switch (ev.button) {
    case 0:
      if (gGame.megaHintMode) {
      }
      if (gGame.isManualEdit) return handleManualBombClick(i, j)
      if (gGame.hintMode) return handleHintCellClick(i, j)
      if (isFirstMove()) handleFirstClick(i, j)
      return cellClicked(i, j)
    case 2:
      return cellMarked(i, j)
  }
}

function handleFirstClick(i, j) {
  gBoard[i][j].isShown = true
  gGame.isManualMode || gGame.setMines()
  const startTime = Date.now()
  gGame.timerInterval = setInterval(() => updateTime(startTime), 1000)
  renderCell(gBoard, i, j)
  gGame.cellsShown = 1
  if (gBoard[i][j].negMinesCount === 0) expandShown(gBoard, i, j)
}

function handleOverMarked() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const currCell = gBoard[i][j]
      if (!currCell.isMarked) continue

      const elMarkedCell = getElCellByCoords(i, j)
      elMarkedCell.classList.toggle('over-mark')
    }
  }
  const overMarkMsg = document.querySelector('.over-mark-msg')
  overMarkMsg.classList.toggle('hide')
}

function handleHintCellClick(i, j) {
  if (isFirstMove()) return

  const startPos = { i: i - 1, j: j - 1 }
  const endPos = { i: i + 1, j: j + 1 }
  _flashArea(startPos, endPos)
  updateHintsLeft(-1)
  toggleHintMode()
}

function handleMegaHintCellClick(startPos, endPos) {
  if (isFirstMove()) return

  _flashArea(startPos, endPos)
  updateHintsLeft(-1)
  toggleHintMode()
}

function handleManualBombClick(i, j) {
  addMine(gBoard, i, j)
  renderCell(gBoard, i, j)
  setMinesAmount(gGame.marksLeft)
}

function expandShown(board, a, b) {
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === a && j === b) continue
      doExpandShown(board, i, j)
    }
  }
}

function doExpandShown(board, i, j) {
  const currCell = gBoard[i][j]

  if (!isClickable(currCell)) return

  currCell.isShown = true
  renderCell(gBoard, i, j)

  if (currCell.negMinesCount === 0) expandShown(board, i, j)

  gGame.cellsShown++
}

//CHECKERS
function isClickable(cell) {
  return !cell.isMarked && !cell.isShown
}

function checkVictory() {
  const bombsAmount = Object.keys(gGame.minesMarkStatus).length
  const areAllCellsShown = gGame.cellsShown === gLevel.SIZE ** 2 - bombsAmount

  if (areAllCellsShown && areAllMinesMarked()) return gameOver(true)
}

function isFirstMove() {
  // return gGame.timerInterval === 0 && gGame.isOn === true
  return gGame.cellsShown === 0
}

//UPDATORS
function updateEmoji(type) {
  const elEmojiBtn = document.querySelector('.emoji')
  elEmojiBtn.className = `emoji ${gClasses.EMOJI[type]}`
  //Add scared emoji call
}

function updateMarksLeft(diff = 0) {
  gGame.marksLeft += diff

  // const elPropCounter = document.querySelector(`.${'marks-left'}`)
  // elPropCounter.innerText = gGame['marksLeft']

  if (gGame.marksLeft >= 0) renderCount(gGame.marksLeft)
}

function updateSafeClicksLeft(diff = 0) {
  _updateGlobalPropertyLeft('safeClicksLeft', 'safe-clicks-left', diff)
}

function updateLivesLeft(diff = 0) {
  _updateGlobalPropertyLeft('livesLeft', 'lives-left', diff)
}

function updateHintsLeft(diff = 0) {
  _updateGlobalPropertyLeft('hintsLeft', 'hints-left', diff)
}

function _updateGlobalPropertyLeft(propName, className, diff) {
  gGame[propName] += diff

  const elPropCounter = document.querySelector(`.${className}`)
  elPropCounter.innerText = gGame[propName]
}

//UTILS/GETTERS:

function buildBoard(cellArgs = []) {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = createCell(...cellArgs)
    }
  }
  return board
}

function createCell(isMine = false, isShown = false) {
  return {
    negMinesCount: 0,
    isMarked: false,
    isMine,
    isShown,
  }
}

function getTimeSegments(secs) {
  const segments = {}
  segments.hundreds = Math.floor(secs / 100)
  segments.tens = Math.floor((secs % 100) / 10)
  segments.ones = secs % 10
  return segments
}

function getHiddenNonMineElements(board) {
  const nonMineElements = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]
      if (currCell.isShown || currCell.isMine) continue
      nonMineElements.push(getElCellByCoords(i, j))
    }
  }
  return nonMineElements
}

function updateTime(startTime) {
  const currTime = Date.now()
  const elapsed = currTime - startTime

  gGame.secsPassed = parseInt(elapsed / 1000)
  if (gGame.secsPassed < gGame.MAX_TIME) renderTime(gGame.secsPassed)
  //still count towards best time but not update past MAX_TIME
}

function renderTime(secs) {
  const timeSegments = getTimeSegments(secs)

  for (var segment in timeSegments) {
    const timer = document.querySelector(`#timer-${segment}`)
    timer.className = `counter count-${timeSegments[segment]}`
  }
}

function getCountSegments(count) {
  const segments = {}
  segments.tens = Math.floor(count / 10)
  segments.ones = count % 10
  return segments
}

function renderCount(count) {
  const countSegments = getCountSegments(count)

  for (var segment in countSegments) {
    const counter = document.querySelector(`#counter-${segment}`)
    counter.className = `counter count-${countSegments[segment]}`
  }
}

function renderCell(board, i, j) {
  const elCell = getElCellByCoords(i, j)
  elCell.className = getCssClasses(board, i, j)
}

function getCssClasses(board, i, j) {
  const cell = board[i][j]
  const classes = ['cell']
  if (cell.isShown) {
    if (cell.isMine) classes.push('mine')
    else if (cell.negMinesCount) classes.push(`negs-${cell.negMinesCount}`)
    else classes.push('empty')
  } else if (cell.isMarked) {
    classes.push('mark')
  }
  return classes.join(' ')
}

function getElCellByCoords(i, j) {
  return document.querySelector(`#cell-${i}-${j}`)
}

function addMine(board, i, j) {
  if (board[i][j].isMine) return
  board[i][j].isMine = true
  updateMarksLeft(+1)
  gGame.minesMarkStatus[`mine-${i}-${j}`] = false //not marked yet

  _updateNegMinesCount(board, i, j, +1)
}

function removeMine(board, i, j) {
  board[i][j].isMine = false
  updateMarksLeft(-1)
  delete gGame.minesMarkStatus[`mine-${i}-${j}`]

  _updateNegMinesCount(board, i, j, -1)
}

function _updateNegMinesCount(board, a, b, diff) {
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === a && j === b) continue
      board[i][j].negMinesCount += diff
    }
  }
}

function _toggleCellReveal(i, j) {
  gBoard[i][j].isShown = !gBoard[i][j].isShown
  renderCell(gBoard, i, j)
}

function _flashArea(startPos, endPos) {
  const revealedCells = []
  for (var i = startPos.i; i <= endPos.i; i++) {
    for (var j = startPos.j; j <= endPos.j; j++) {
      if (gBoard[i][j].isShown) continue

      revealedCells.push([i, j])
      _toggleCellReveal(i, j)
    }
  }

  setTimeout(() => {
    for (var i = 0; i < revealedCells.length; i++) {
      _toggleCellReveal(...revealedCells[i])
    }
  }, gGame.HINT_FLASH_TIME)
}

function copyObj(board) {
  return JSON.parse(JSON.stringify(board))
}
