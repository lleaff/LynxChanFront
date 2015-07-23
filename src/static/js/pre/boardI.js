if (pageId === 'board') {
  window.board = true;
  window.boardUri = document.getElementById('boardIdentifier').value;

  window.postButton = document.getElementById('jsButton');
  showElement(postButton);

  if (document.getElementById('captchaDiv')) {
    showElement(document.getElementById('reloadCaptchaButton'));
  }

  removeElement(document.getElementById('formButton'));

}

