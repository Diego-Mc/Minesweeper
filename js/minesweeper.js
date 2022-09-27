'use strict'

var gBoard
var gLevel
var gHistory
var gGame

var gEmoji = {
  HAPPY: 'emoji-happy',
  DEAD: 'emoji-death',
  COOL: 'emoji-cool',
  SCARED: 'emoji-scared',
}

function toggleDarkMode() {
  gGame.isDarkMode = !gGame.isDarkMode
  localStorage.setItem('isDarkMode', gGame.isDarkMode)

  updateColorMode()
}

function isDarkMode() {
  return localStorage.getItem('isDarkMode') === 'true'
}

function updateColorMode() {
  const searchQuery = `.${gGame.isDarkMode ? 'light' : 'dark'}`
  const elements = document.querySelectorAll(searchQuery)
  for (var i = 0; i < elements.length; i++) {
    const element = elements[i]
    element.classList.toggle('light')
    element.classList.toggle('dark')

    if (element.classList.contains('custom-btn')) {
      const elImg = element.querySelector('img')
      if (!elImg) continue

      const darkFile = 'dark-mode/' + element.id
      const lightFile = element.id

      var imgSrc = elImg.src
      if (gGame.isDarkMode) imgSrc = imgSrc.replace(lightFile, darkFile)
      else imgSrc = imgSrc.replace(darkFile, lightFile)
      elImg.src = imgSrc
    }
  }
  renderHelpersLeft()
}

function renderBtns() {
  var gameModesEl = document.querySelector('.game-modes')
  gameModesEl.innerHTML =
    getButtonHTML('beginner', 'Beginner', 'handleGameModeBtn(this)') +
    getButtonHTML('medium', 'Medium', 'handleGameModeBtn(this)') +
    getButtonHTML('expert', 'Expert', 'handleGameModeBtn(this)') +
    getButtonHTML('seven-boom', '7-Boom', 'handleGameModeBtn(this)') +
    getButtonHTML('manual', 'Manual Mode', 'handleGameModeBtn(this)')

  var gameModesEl = document.querySelector('.helper-buttons-container')
  gameModesEl.innerHTML =
    getButtonHTML('hint', 'Hint', 'handleHelperBtn(this)') +
    getButtonHTML('safe-click', 'Safe Click', 'handleHelperBtn(this)') +
    getButtonHTML('mega-hint', 'Mega Hint', 'handleHelperBtn(this)') +
    getButtonHTML('exterminator', 'Exterminator', 'handleHelperBtn(this)')
}

function initGame() {
  resetGame()
  resetSelectedGameMode()

  gBoard = buildBoard()
  renderBoard(gBoard)
}

function resetGame() {
  if (gGame && gGame.timerInterval) clearTimer()
  const difficulty = updateLastSelectedDifficulty()

  gGame = {
    isOn: true,
    marksLeft: 0,
    secsPassed: 0,
    livesLeft: gLevel.LIVES,
    timerInterval: 0,
    cellsLeft: 0,
    setMines: setMinesRandomly,
    isDarkMode: isDarkMode(),
    lastActionPos: {},
    difficulty,
  }

  gHistory = {
    gBoards: [],
    gGames: [],
    i: 0,
    length: 0,
  }

  renderBtns()
  populateHelpers()
  disableBtns()
  resetSelectedHelper()

  updateMarksLeft()
  updateLivesLeft()
  updateEmoji('HAPPY')

  updateColorMode()

  renderTime()
  renderBestRecord()
}

function undoMove() {
  _doHistoryPush()
  gHistory.i--

  _resetHistoryState()

  if (!gGame.timerInterval) startTimer(gGame.secsPassed)

  enableBtn('redo-btn')
  if (gHistory.i === 0) disableBtn('undo-btn')
}

function redoMove() {
  _doHistoryPush()
  gHistory.i++

  _resetHistoryState()

  enableBtn('undo-btn')
  if (gHistory.i === gHistory.length) {
    checkGameOver(gGame.lastActionPos)
    disableBtn('redo-btn')
  }
}

function _resetHistoryState() {
  gBoard = gHistory.gBoards[gHistory.i]
  const historyGame = gHistory.gGames[gHistory.i]
  _updateGameObjFromGameObj(gGame, historyGame)

  renderBoard(gBoard)
  updateLivesLeft()
  updateMarksLeft()
  updateEmoji('HAPPY')
  enableHelpers()
}

function gameOver(didWin, deathLoc = null) {
  gGame.isOn = false
  clearTimer()
  resetSelectedGameMode()
  resetSelectedHelper()
  disableHelpers()

  updateEmoji(didWin ? 'COOL' : 'DEAD')

  if (didWin) {
    const recordQuery = `best-record-${gGame.difficulty}`
    const shortestTime = localStorage.getItem(recordQuery)
    const isNewRecord = !shortestTime || gGame.secsPassed < shortestTime

    if (isNewRecord) localStorage.setItem(recordQuery, gGame.secsPassed)
  } else {
    renderMinesOnLoss(deathLoc)
  }
}

function disableBtns() {
  disableHelpers()
  disableBtn('undo-btn')
  disableBtn('redo-btn')
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

function _getMineLocFromId(mineId) {
  //mine-i-j
  const idParts = mineId.split('-')
  return { i: +idParts[1], j: +idParts[2] }
}

//TODO: render scared emoji

function pushToHistory() {
  _doHistoryPush()
  gHistory.i++
  gHistory.length = gHistory.i
  disableBtn('redo-btn')
  enableBtn('undo-btn')
}

function _doHistoryPush() {
  gHistory.gBoards[gHistory.i] = copyObj(gBoard)

  const historyGame = {}
  _updateGameObjFromGameObj(historyGame, gGame)
  gHistory.gGames[gHistory.i] = historyGame
}

function _handleFirstHistoryPush() {
  //all mines generate after 1st click so to make the experience
  //of going back to a new board...
  const firstBoard = gHistory.gBoards[0]
  for (var i = 0; i < firstBoard.length; i++) {
    for (var j = 0; j < firstBoard[0].length; j++) {
      const firstBoardCell = firstBoard[i][j]
      const newBoardCell = gBoard[i][j]

      firstBoardCell.isMine = newBoardCell.isMine
      firstBoardCell.isMarked = newBoardCell.isMarked
      firstBoardCell.negMinesCount = newBoardCell.negMinesCount
    }
  }
  const firstGame = gHistory.gGames[0]
  firstGame.marksLeft = gGame.marksLeft
  firstGame.cellsLeft = gLevel.SIZE ** 2 - gGame.marksLeft
}

function _updateGameObjFromGameObj(historyGameObj, gameObj) {
  const gameTemplate = {
    isOn: '',
    marksLeft: '',
    cellsLeft: '',
    livesLeft: '',
    secsPassed: '',
  }
  for (var key in gameTemplate) {
    historyGameObj[key] = gameObj[key]
  }
  historyGameObj.lastActionPos = copyObj(gameObj.lastActionPos)
}

function cellClicked(i, j) {
  const currCell = gBoard[i][j]

  if (!isClickable(currCell)) return

  pushToHistory()

  currCell.isShown = true

  if (isFirstClick()) handleFirstClick()

  gGame.lastActionPos = { i, j }

  renderCell(gBoard, i, j)

  if (currCell.isMine) {
    updateLivesLeft(-1)
    updateMarksLeft(-1)
    checkGameOver({ i, j })
    return
  }

  gGame.cellsLeft--

  if (currCell.negMinesCount === 0) expandShown(gBoard, i, j)

  checkGameOver({ i, j })
}

function cellMarked(i, j) {
  const currCell = gBoard[i][j]
  const cantMark = !currCell.isMarked && gGame.marksLeft <= 0

  if (currCell.isShown || cantMark) return

  pushToHistory()

  currCell.isMarked = !currCell.isMarked

  renderCell(gBoard, i, j)

  gGame.lastActionPos = { i, j }

  updateMarksLeft(currCell.isMarked ? -1 : +1)

  checkGameOver({ i, j })
}

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

function renderMinesOnLoss(deathLoc) {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const currCell = gBoard[i][j]
      if (currCell.isMarked && currCell.isMine) continue

      if (!currCell.isMarked && currCell.isMine) {
        currCell.isShown = true
        renderCell(gBoard, i, j)
      } else if (currCell.isMarked && !currCell.isMine) {
        currCell.isShown = true
        const className = supportDark('mine-wrong')
        renderCell(gBoard, i, j, className)
      }
    }
  }
  const className = supportDark('mine-death')
  renderCell(gBoard, deathLoc.i, deathLoc.j, className)
}

//HANDLERS
function handleClick(ev, elCell, i, j) {
  if (!gGame.isOn) return
  switch (ev.button) {
    case 0:
      if (isHelperPressed(gHelpers.MEGA_HINT)) {
        return handleMegaHintCellClick(i, j)
      }
      if (isHelperPressed(gHelpers.HINT)) {
        return handleHintCellClick(i, j)
      }
      if (isGameModePressed(gGameModes.MANUAL)) {
        return handleManualBombClick(i, j)
      }
      return cellClicked(i, j)
    case 2:
      if (!isFirstClick()) return cellMarked(i, j)
  }
}

function handleManualBombClick(i, j) {
  addMine(gBoard, i, j)
  renderCell(gBoard, i, j)
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

  gGame.cellsLeft--
}

//CHECKERS
function isClickable(cell) {
  return !cell.isMarked && !cell.isShown
}

function checkGameOver(cellLoc) {
  const didWin = gGame.cellsLeft === 0 && gGame.marksLeft === 0
  const didLose = gGame.livesLeft === 0

  if (didWin) gameOver(true)
  if (didLose) gameOver(false, cellLoc)
}

function isFirstClick() {
  return gGame.timerInterval === 0 && gGame.isOn === true
}

function handleFirstClick() {
  startTimer()

  enableHelpers()
  enableBtn('undo-btn')

  gGame.setMines()
  gGame.cellsLeft = gLevel.SIZE ** 2 - gGame.marksLeft
  _handleFirstHistoryPush()
  gGame.setMines = () => {} //reset for undo purposes
}

function startTimer(secsPassed = 0) {
  const startTime = Date.now()
  gGame.timerInterval = setInterval(
    () => updateTime(startTime, secsPassed),
    1000
  )
}

function clearTimer(secsPassed = 0) {
  clearInterval(gGame.timerInterval)
  gGame.timerInterval = 0
}

//UPDATORS

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

function renderCell(board, i, j, additionalClasses = '') {
  const elCell = getElCellByCoords(i, j)
  elCell.className = `${getCssClasses(board, i, j)} ${additionalClasses}`
}

function getCssClasses(board, i, j) {
  const cell = board[i][j]
  const cellClassName = supportDark('cell')
  const classes = [cellClassName]

  if (cell.isShown) {
    if (cell.isMine) classes.push('mine')
    else if (cell.negMinesCount) classes.push(`negs-${cell.negMinesCount}`)
    else classes.push('empty')
  } else if (cell.isMarked) classes.push('mark')

  return classes.join(' ')
}

function getElCellByCoords(i, j) {
  return document.querySelector(`#cell-${i}-${j}`)
}

function addMine(board, i, j) {
  if (board[i][j].isMine) return
  board[i][j].isMine = true
  updateMarksLeft(+1)

  _updateNegMinesCount(board, i, j, +1)
}

function removeMine(board, i, j) {
  board[i][j].isMine = false
  updateMarksLeft(-1)

  _updateNegMinesCount(board, i, j, -1)
}

function _updateNegMinesCount(board, a, b, diff) {
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === a && j === b) continue
      board[i][j].negMinesCount += diff
      renderCell(board, i, j)
    }
  }
}

function _revealCell(i, j) {
  const cell = gBoard[i][j]
  const elCell = getElCellByCoords(i, j)

  const cellClassName = supportDark('cell')
  const classes = [cellClassName]

  if (cell.isMine) classes.push('mine')
  else if (cell.negMinesCount) classes.push(`negs-${cell.negMinesCount}`)
  else classes.push('empty')

  elCell.className = classes.join(' ')
}

function _flashArea(startPos, endPos, flashTime) {
  const minI = Math.min(startPos.i, endPos.i)
  const minJ = Math.min(startPos.j, endPos.j)
  const maxI = Math.max(startPos.i, endPos.i)
  const maxJ = Math.max(startPos.j, endPos.j)

  const revealedCells = []
  for (var i = minI; i <= maxI; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = minJ; j <= maxJ; j++) {
      if (j < 0 || j >= gBoard[0].length) continue
      if (gBoard[i][j].isShown) continue

      revealedCells.push([i, j])
      _revealCell(i, j)
    }
  }
  gGame.isOn = false
  disableHelpers()

  setTimeout(() => {
    for (var i = 0; i < revealedCells.length; i++) {
      renderCell(gBoard, ...revealedCells[i])
    }
    gGame.isOn = true
    enableHelpers()
  }, flashTime)
}
