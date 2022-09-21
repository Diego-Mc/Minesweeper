'use strict'

var gBoard = []

var gLevel = {
  SIZE: 5,
  MINES: 4,
  LIVES: 3,
}

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  cellsShown: 0,
  livesCount: 0,
}

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

function initGame() {
  gBoard = buildBoard()
  gGame.markedCount = gLevel.MINES
  updateMarkedCount()
  gGame.livesCount = gLevel.LIVES
  updateLivesCount()
  updateEmoji('HAPPY')
  gGame.cellsShown = 0
  gGame.isOn = false

  renderBoard(gBoard)
}

function updateEmoji(type) {
  const elEmojiBtn = document.querySelector('.emoji')
  elEmojiBtn.innerText = gElements.EMOJI[type]
}

function updateMarkedCount(diff = 0) {
  gGame.markedCount += diff

  const elMarksCount = document.querySelector('.marks-count')
  elMarksCount.innerText = gGame.markedCount
}

function updateLivesCount(diff = 0) {
  gGame.livesCount += diff

  const elLivesCount = document.querySelector('.lives-count')
  elLivesCount.innerText = gGame.livesCount
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

function cellClicked(elCell, i, j) {
  if (elCell === null) return
  console.log('cell click', elCell.classes, i, j)

  var currCell = gBoard[i][j]

  if (currCell.isMarked || currCell.isShown) return

  if (!gGame.isOn) {
    gGame.isOn = true
    setMines()
    console.log('A', gBoard)
    setMinesNegsCount()
    console.log(gBoard)
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
  if (checkGameOver()) return gameOver(true)
}

function gameOver(didWin) {
  console.log(`You ${didWin ? 'won' : 'lost'}!`)
  updateEmoji(didWin ? 'COOL' : 'DEAD')
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

//TODO: add smiley
//TODO: add hints (3, when clicked + a cell, it will show the cell&negs for 1s)
//TODO: keep best score in localstorage and show to user leaderboard
//TODO: recursively open all cells
//TODO: safe-click button, each have 3, will mark a random cell for few s. that is safe to click
//TODO: manually positioned mines button, a user can configure where mines are
//TODO: undo button
//TODO: 7-boom, place mines based on cell-index % 7
//TODO: dark mode
//TODO: mega hint button, after click you can select top-left & bottom-right corners of area you want to see for 2sec
//TODO: mine exterminator buddy - will remove 3 random mines
