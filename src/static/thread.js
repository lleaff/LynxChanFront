var boardUri;
var threadId;
var board = false;

if (!DISABLE_JS) {

  boardUri = document.getElementById('boardIdentifier').value;

  if (document.getElementById('controlThreadIdentifier')) {
    threadId = document.getElementById('controlThreadIdentifier').value;
    document.getElementById('settingsJsButon').style.display = 'inline';
    document.getElementById('settingsFormButon').style.display = 'none';
  }

  document.getElementById('jsButton').style.display = 'inline';

  document.getElementById('formButton').style.display = 'none';

}

function saveThreadSettings() {

  apiRequest('changeThreadSettings', {
    boardUri : boardUri,
    threadId : threadId,
    pin : document.getElementById('checkboxPin').checked,
    lock : document.getElementById('checkboxLock').checked
  }, function setLock(status, data) {

    if (status === 'ok') {

      alert('Settings saved.');

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function sendReplyData(files) {

  var forcedAnon = !document.getElementById('fieldName');

  if (!forcedAnon) {
    var typedName = document.getElementById('fieldName').value.trim();
  }

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value.trim();

  var threadId = document.getElementById('threadIdentifier').value;

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
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6) {
    alert('Captchas are exactly 6 characters long.');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  apiRequest('replyThread', {
    name : forcedAnon ? null : typedName,
    captcha : hiddenCaptcha ? null : typedCaptcha,
    subject : typedSubject,
    spoiler : document.getElementById('checkboxSpoiler').checked,
    password : typedPassword,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri,
    threadId : threadId
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Reply posted.');

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

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
    sendReplyData(files);
  }

}

function postReply() {

  iterateSelectedFiles(0, [], document.getElementById('files'));
}
