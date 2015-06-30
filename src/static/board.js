var board = true;
var boardUri = document.getElementById('boardIdentifier').value;

if (!DISABLE_JS) {

  var postButton = document.getElementById('jsButton');
  postButton.style.display = 'inline';

  if (document.getElementById('captchaDiv')) {
    document.getElementById('reloadCaptchaButton').style.display = 'inline';
  }

  document.getElementById('formButton').style.display = 'none';

}

function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';

  document.getElementById('captchaImage').src = '/captcha.js#'
      + new Date().toString();

}

var postCallback = function requestComplete(status, data) {

  if (status === 'ok') {

    alert('Thread created.');

    window.location.pathname = '/' + boardUri + '/res/' + data + '.html';

  } else {
    alert(status + ': ' + JSON.stringify(data));
  }
};

postCallback.stop = function() {
  postButton.style.display = 'inline';
};

function sendThreadData(files) {

  var forcedAnon = !document.getElementById('fieldName');

  if (!forcedAnon) {
    var typedName = document.getElementById('fieldName').value.trim();
  }

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value.trim();

  var hiddenCaptcha = !document.getElementById('captchaDiv');

  if (!hiddenCaptcha) {
    var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();
  }

  if (!typedMessage.length) {
    alert('A message is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    alert('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > 2048) {
    alert('Message is too long, keep it under 2048 characters.');
    return;
  } else if (typedEmail.length > 64) {
    alert('Email is too long, keep it under 64 characters.');
    return;
  } else if (typedSubject.length > 32) {
    alert('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    alert('Password is too long, keep it under 8 characters.');
    return;
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6
      && typedCaptcha.length !== 24) {
    alert('Captchas are exactly 6 (24 if no cookies) characters long.');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  postButton.style.display = 'none';

  apiRequest('newThread', {
    name : forcedAnon ? null : typedName,
    captcha : hiddenCaptcha ? null : typedCaptcha,
    password : typedPassword,
    spoiler : document.getElementById('checkboxSpoiler').checked,
    subject : typedSubject,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri
  }, postCallback);

}

function iterateSelectedFiles(currentIndex, files, fileChooser) {

  if (currentIndex < fileChooser.files.length) {
    var reader = new FileReader();

    reader.onloadend = function(e) {

      files.push({
        name : fileChooser.files[currentIndex].name,
        content : reader.result
      });

      iterateSelectedFiles(currentIndex + 1, files, fileChooser);

    };

    reader.readAsDataURL(fileChooser.files[currentIndex]);
  } else {
    sendThreadData(files);
  }

}

function postThread() {

  iterateSelectedFiles(0, [], document.getElementById('files'));
}
