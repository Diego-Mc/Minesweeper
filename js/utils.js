'use strict'

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function renderButton(idName, innerText, onClickFuncStr = null) {
  var buttonHTML = `<div class="custom-btn"${
    onClickFuncStr ? ` onclick="${onClickFuncStr}"` : ''
  } id=${idName}>`
  var topPart = '<div class="custom-btn-chunk">'
  var midPart = '<div class="custom-btn-chunk">'
  var bottomPart = '<div class="custom-btn-chunk">'

  topPart += _getButtonPart('btn-tl')
  topPart += _getButtonPart('btn-ht')
  topPart += _getButtonPart('btn-tr')
  topPart += '</div>'
  midPart += _getButtonPart('btn-vl')
  midPart += `<span class="custom-btn-content"><img class="custom-btn-img" src="sprites/btn-icons/${idName}.png"> <span>${innerText}</span></span>`
  midPart += _getButtonPart('btn-vr')
  midPart += '</div>'
  bottomPart += _getButtonPart('btn-bl')
  bottomPart += _getButtonPart('btn-hb')
  bottomPart += _getButtonPart('btn-br')
  bottomPart += '</div>'

  buttonHTML += topPart + midPart + bottomPart + '</div>'

  return buttonHTML
}

function _getButtonPart(className) {
  return `<span class="custom-btn-part ${className}"></span>`
}
