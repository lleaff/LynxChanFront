if (pageId === 'board') {
  bodyOnLoadStack.push(function() {

    var board = true;
    var boardUri = document.getElementById('boardIdentifier').value;

    var postButton = document.getElementById('jsButton');
    postButton.style.display = '';

    if (document.getElementById('captchaDiv')) {
      document.getElementById('reloadCaptchaButton').style.display = '';
    }

    document.getElementById('formButton').style.display = 'none';

  });
}

