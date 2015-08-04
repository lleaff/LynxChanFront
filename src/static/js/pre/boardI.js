if (pageId === 'board') {
  window.board = true;
  window.boardUri = document.getElementById('boardIdentifier').value;

  window.hiddenCaptcha = !document.getElementById('captchaDiv');
  window.postButton = document.getElementById('jsButton');
  showElement(postButton);

  if (document.getElementById('captchaDiv')) {
    showElement(document.getElementById('reloadCaptchaButton'));
  }

  removeElement(document.getElementById('formButton'));

}

