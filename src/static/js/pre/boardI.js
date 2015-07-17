if (pageId === 'board') {
  bodyOnLoadStack.push(function() {

    window.board = true;
    var boardUri = document.getElementById('boardIdentifier').value;

    var postButton = document.getElementById('jsButton');
    showElement(postButton);

    if (document.getElementById('captchaDiv')) {
      showElement(document.getElementById('reloadCaptchaButton'));
    }

    removeElement(document.getElementById('formButton'));

  });
}

