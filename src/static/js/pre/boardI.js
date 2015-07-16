if (pageId === 'board') {
  bodyOnLoadStack.push(function() {

    var board = true;
    var boardUri = document.getElementById('boardIdentifier').value;

    var postButton = document.getElementById('jsButton');
    showElement(postButton);

    if (document.getElementById('captchaDiv')) {
      showElement(document.getElementById('reloadCaptchaButton'));
    }

    removeElement(document.getElementById('formButton'));

  });
}

