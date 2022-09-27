'use strict'

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function copyObj(board) {
  return JSON.parse(JSON.stringify(board))
}

function supportDark(className) {
  return `${gGame.isDarkMode ? 'dark' : 'light'} ${className}`
}

function supportDarkFile(fileName) {
  if (gGame.isDarkMode) {
    return 'dark-mode/' + fileName
  }
  return fileName
}
