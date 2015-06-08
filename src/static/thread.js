var boardUri;
var threadId;

if (!DISABLE_JS) {

  boardUri = document.getElementById('boardIdentifier').value;
  threadId = document.getElementById('controlThreadIdentifier').value;

  document.getElementById('jsButton').style.display = 'inline';
  document.getElementById('lockJsButton').style.display = 'inline';
  document.getElementById('pinJsButton').style.display = 'inline';

  document.getElementById('pinFormButton').style.display = 'none';
  document.getElementById('lockFormButton').style.display = 'none';
  document.getElementById('formButton').style.display = 'none';

}

function setPin() {

  apiRequest('setThreadPin', {
    boardUri : boardUri,
    threadId : threadId,
    pin : document.getElementById('checkboxPin').checked
  }, function setLock(status, data) {

    if (status === 'ok') {

      alert('Pin set.');

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function setLock() {

  apiRequest('setThreadLock', {
    boardUri : boardUri,
    threadId : threadId,
    lock : document.getElementById('checkboxLock').checked
  }, function setLock(status, data) {

    if (status === 'ok') {

      alert('Lock set.');

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function sendReplyData(files) {

  var typedName = document.getElementById('fieldName').value.trim();
  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value.trim();

  var threadId = document.getElementById('threadIdentifier').value;

  if (!typedMessage.length) {
    alert('A message is mandatory.');
    return;
  } else if (typedName.length > 32) {
    alert('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > 32) {
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
  } else if (typedCaptcha.length !== 6) {
    alert('Captchas are exactly 6 characters long.');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  apiRequest('replyThread', {
    name : typedName,
    subject : typedSubject,
    captcha : typedCaptcha,
    password : typedPassword,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri,
    threadId : threadId
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Reply posted.');

      window.location.pathname = '/' + boardUri + '/res/' + threadId + '.html#'
          + data;

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
