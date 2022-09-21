'use strict'

var gBoard = []

var gLevel = {
  SIZE: 5,
  MINES: 4,
  LIVES: 3,
  HINTS: 3,
  SAFE_CLICKS: 3,
}

var gGame = {
  isOn: false, //TODO: block behaviour and btns based on this
  markedCount: 0,
  secsPassed: 0,
  cellsShown: 0,
  livesCount: 0, //change to lives left
  timerInterval: 0,
  hintMode: false,
  hintsCount: 0, //change to hints left
  safeClicksCount: 0, //change to safe clicks left
}

var gHistory = [] //to be continued...

var gElements = {
  EMOJI: {
    HAPPY: '😃',
    DEAD: '😵',
    COOL: '😎',
    SCARED: '😨',
  },
  LIFE: '❤️',
  HINT: '💡',
}

function toggleHintMode() {
  gGame.hintMode = !gGame.hintMode //TODO: add visual indicator
}

function initGame() {
  gameOver() //TODO: change to reset function instead
  gBoard = buildBoard()
  gGame.markedCount = gLevel.MINES
  updateMarkedCount()
  gGame.livesCount = gLevel.LIVES
  updateLivesCount()
  gGame.hintsCount = gLevel.LIVES
  updateHintsCount()
  gGame.safeClicksCount = gLevel.SAFE_CLICKS
  updateSafeClicksCount()
  updateEmoji('HAPPY')
  gGame.cellsShown = 0
  gGame.isOn = false
  gGame.secsPassed = 0
  renderTime(0)
  gGame.hintMode = false
  displayBestRecord()

  renderBoard(gBoard)
}

function updateEmoji(type) {
  const elEmojiBtn = document.querySelector('.emoji')
  elEmojiBtn.innerText = gElements.EMOJI[type]
  //Add scared emoji call
}

function updateMarkedCount(diff = 0) {
  gGame.markedCount += diff

  const elMarksCount = document.querySelector('.marks-count')
  elMarksCount.innerText = gGame.markedCount
}

function updateSafeClicksCount(diff = 0) {
  gGame.safeClicksCount += diff

  const elSafeClicksCount = document.querySelector('.safe-clicks-count')
  elSafeClicksCount.innerText = gGame.safeClicksCount
}

function updateLivesCount(diff = 0) {
  gGame.livesCount += diff

  const elLivesCount = document.querySelector('.lives-count')
  elLivesCount.innerText = gGame.livesCount
}

function updateHintsCount(diff = 0) {
  gGame.hintsCount += diff

  const elHintsCount = document.querySelector('.hints-count')
  elHintsCount.innerText = gGame.hintsCount
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = createCell()
    }
  }
  return board
}

function createCell(isMine = false) {
  return {
    minesAroundCount: 0,
    isMarked: false,
    isMine,
    isShown: false,
  }
}

function setMinesNegsCount(board = gBoard) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      board[i][j].minesAroundCount = countNegMines(board, i, j)
    }
  }
}

function countNegMines(board, a, b) {
  if (board[a][b].isMine) return 0

  var mineCount = 0
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === a && j === b) continue

      if (board[i][j].isMine) mineCount++
    }
  }
  return mineCount
  //could also be put into setMines //TODO?
}

function setMines(board = gBoard) {
  var minesCount = gLevel.MINES
  while (minesCount > 0) {
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[0].length; j++) {
        const currCell = board[i][j]
        if (currCell.isMine || currCell.isShown) continue

        if (isTrueByProb(gLevel.MINES / board.length ** 2)) {
          currCell.isMine = true
          minesCount--
        }

        if (minesCount === 0) return
      }
    }
  }
}

function renderBoard(board) {
  var elGameBoard = document.querySelector('.game-board')
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      const classes = getCssClasses(board, i, j)
      const events = `onmouseup="handleClick(event,this,${i},${j})"`
      strHTML += `<td ${events} class=${classes} id="cell-${i}-${j}"></td>`
    }
    strHTML += '</tr>'
  }
  elGameBoard.innerHTML = strHTML
}

function getCssClasses(board, i, j) {
  var cell = board[i][j]
  var classes = ['cell']
  if (cell.isShown) {
    if (cell.minesAroundCount) classes.push(`negs-${cell.minesAroundCount}`)
    else if (cell.isMine) classes.push('mine')
    else classes.push('empty')
  } else if (cell.isMarked) {
    classes.push('mark')
  }
  return classes.join(' ')
}

function toggleShowingCellAndNegs(board, a, b) {
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      const elCell = getElCellByCoords(i, j)
      board[i][j].isShown = !board[i][j].isShown
      renderCell(board, elCell, i, j)
    }
  }
}

function cellClicked(elCell, i, j) {
  if (elCell === null) return

  var currCell = gBoard[i][j]

  if (gGame.hintMode && gGame.hintsCount > 0) {
    toggleShowingCellAndNegs(gBoard, i, j)
    updateHintsCount(-1)
    toggleHintMode()
    setTimeout(() => toggleShowingCellAndNegs(gBoard, i, j), 1000)
    return
  }

  if (currCell.isMarked || currCell.isShown) return

  if (!gGame.isOn) {
    //TODO: not promising no mines currently...
    gGame.isOn = true
    setMines()
    setMinesNegsCount()
    const currTime = Date.now()
    gGame.timerInterval = setInterval(() => updateTime(currTime), 1000)
  }

  currCell.isShown = true

  renderCell(gBoard, elCell, i, j)

  if (!currCell.isMine && currCell.minesAroundCount === 0) {
    expandShown(gBoard, i, j)
  }

  if (currCell.isMine) {
    if (gGame.livesCount === 0) return gameOver(false)
    if (gGame.markedCount === 0) return gameOver(false)
    updateLivesCount(-1)
    updateMarkedCount(-1)
    gGame.cellsShown-- //even out: mines not included as empty cells
    //TODO: refactor this
  }

  gGame.cellsShown++
  gHistory.push(gBoard) //TODO: fix expendShown behaviour, currently it's relying on depicting cellClicked, but cellClicked should be refactored to other functions that exprendShown can also use as to not count as a full move to history
  if (checkGameOver()) return gameOver(true)
}

function gameOver(didWin) {
  clearInterval(gGame.timerInterval)
  console.log(`You ${didWin ? 'won' : 'lost'}!`)
  updateEmoji(didWin ? 'COOL' : 'DEAD')

  if (didWin) {
    const shortestTime = localStorage.getItem('best-record')
    const isNewRecord = !shortestTime || gGame.secsPassed < shortestTime

    if (isNewRecord) localStorage.setItem('best-record', gGame.secsPassed)
  }
}

function displayBestRecord() {
  const elBestRecord = document.querySelector('.best-record')
  const bestRecord = localStorage.getItem('best-record')

  elBestRecord.innerText = bestRecord
}

function cellMarked(elCell, i, j) {
  console.log('cell mark', elCell, gBoard)

  const currCell = gBoard[i][j]
  const cantMark = !currCell.isMarked && gGame.markedCount <= 0

  if (currCell.isShown || cantMark) return

  currCell.isMarked = !currCell.isMarked

  renderCell(gBoard, elCell, i, j)

  updateMarkedCount(currCell.isMarked ? -1 : +1)

  if (checkGameOver()) return gameOver(true)
}

function renderCell(board, elCell, i, j) {
  elCell.className = getCssClasses(board, i, j)
}

function checkGameOver() {
  var areAllCellsShown = gGame.cellsShown === gLevel.SIZE ** 2 - gLevel.MINES
  var areAllMinesMarked = gGame.markedCount === 0

  return areAllCellsShown && areAllMinesMarked
}

function handleClick(ev, elCell, i, j) {
  switch (ev.button) {
    case 0:
      return cellClicked(elCell, i, j)
    case 2:
      return cellMarked(elCell, i, j)
  }
}

function expandShown(board, a, b) {
  for (var i = a - 1; i <= a + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = b - 1; j <= b + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === a && j === b) continue
      cellClicked(getElCellByCoords(i, j), i, j)
    }
  }
}

function getElCellByCoords(i, j) {
  console.log('HEY', i, j)
  return document.querySelector(`#cell-${i}-${j}`)
}

function updateTime(startTime) {
  const currTime = Date.now()
  const elapsed = currTime - startTime

  gGame.secsPassed = parseInt(elapsed / 1000)
  renderTime(gGame.secsPassed)
}

function renderTime(secs) {
  const elTimer = document.querySelector('.timer')
  elTimer.innerText = secs
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

function renderSafeClick(board) {
  const nonMineElements = getHiddenNonMineElements(board)
  const randIdx = getRandomInt(0, nonMineElements.length)
  const safeElement = nonMineElements[randIdx]

  if (!safeElement) return

  safeElement.classList.add('safe')

  setTimeout(() => safeElement.classList.remove('safe'), 2000)
}

function handleSafeClick() {
  if (gGame.safeClicksCount === 0) return

  updateSafeClicksCount(-1)
  renderSafeClick(gBoard)
}

//TODO: manually positioned mines button, a user can configure where mines are
//TODO: undo button
//TODO: 7-boom, place mines based on cell-index % 7
//TODO: dark mode
//TODO: mega hint button, after click you can select top-left & bottom-right corners of area you want to see for 2sec
//TODO: mine exterminator buddy - will remove 3 random mines
