'use strict'

function isTrueByProb(fraction) {
  return fraction - Math.random() > 0
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}
