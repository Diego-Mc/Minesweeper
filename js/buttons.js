'use strict'

function handleButtonPress(elBtn, currBtnSelected, buttons) {
  const buttonId = elBtn.id

  if (!currBtnSelected.id) {
    toggleSelectBtn(buttonId)
    currBtnSelected.id = buttonId
  } else if (currBtnSelected.id === buttonId) {
    toggleSelectBtn(buttonId)
    currBtnSelected.id = ''
  } else {
    toggleSelectBtn(currBtnSelected.id)
    toggleSelectBtn(buttonId)
    currBtnSelected.id = buttonId
  }

  const button = getButtonById(buttonId, buttons)
  if (button && button.handler) button.handler()
}

function getButtonHTML(idName, innerText, onClickFuncStr = null) {
  const startingImgHTML = `<img class="custom-btn-img" src="sprites/btn-icons/`
  const fileName = supportDarkFile(idName)
  const imgHTML = `${startingImgHTML + fileName}.png">`
  const innerTextHTML = `<span>${innerText}</span>`
  const contentHTML = imgHTML + innerTextHTML
  const contentClassHTML = `class="custom-btn-content"`
  const contentContainerHTML = `<span ${contentClassHTML}>${contentHTML}</span>`

  const btnClassName = `class="${supportDark('custom-btn')}"`
  const onClickStr = onClickFuncStr ? ` onclick="${onClickFuncStr}"` : ''
  const btnAttributes = `${btnClassName} ${onClickStr} id="${idName}"`
  const buttonHTML = `<button ${btnAttributes}>${contentContainerHTML}</button>`

  return buttonHTML
}

function disableBtn(idName) {
  const elBtn = document.querySelector(`#${idName}`)
  const elIcon = elBtn.querySelector('img')
  const startingImgHTML = `sprites/btn-icons/`
  const fileName = supportDarkFile(idName)
  const imgHTML = `${startingImgHTML + fileName}_disabled.png`
  if (elIcon) elIcon.src = imgHTML
  elBtn.disabled = true
}

function enableBtn(idName) {
  const elBtn = document.querySelector(`#${idName}`)
  const elIcon = elBtn.querySelector('img')
  const startingImgHTML = `sprites/btn-icons/`
  const fileName = supportDarkFile(idName)
  const imgHTML = `${startingImgHTML + fileName}.png`
  if (elIcon) elIcon.src = imgHTML
  elBtn.disabled = false
}

function toggleSelectBtn(idName) {
  const elBtn = document.querySelector(`#${idName}`)
  elBtn.classList.toggle('btn-active')
}

function unselectButton(button, currBtnSelected) {
  toggleSelectBtn(button.id)
  if (button.amountLeft === 0) disableBtn(button.id)
  currBtnSelected.id = ''
}

function getButtonById(buttonId, buttons) {
  for (var buttonName in buttons) {
    const button = buttons[buttonName]
    if (button.id === buttonId) return button
  }
  return null
}
