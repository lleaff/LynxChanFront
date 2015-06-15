var board = true;

if (!DISABLE_JS) {

  document.getElementById('jsButton').style.display = 'inline';
  document.getElementById('formButton').style.display = 'none';

}

function sendThreadData(files) {

  var typedName = document.getElementById('fieldName').value.trim();
  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var boardUri = document.getElementById('boardIdentifier').value;
  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value.trim();

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

  apiRequest('newThread', {
    name : typedName,
    captcha : typedCaptcha,
    password : typedPassword,
    spoiler : document.getElementById('checkboxSpoiler').checked,
    subject : typedSubject,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Thread created.');

      window.location.pathname = '/' + boardUri + '/res/' + data + '.html';

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
    sendThreadData(files);
  }

}

function postThread() {

  iterateSelectedFiles(0, [], document.getElementById('files'));
}
