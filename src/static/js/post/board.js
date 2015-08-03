function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';

  document.getElementById('captchaImage').src = '/captcha.js#'+
    new Date().toString();
  /* Clear the text field */
  document.getElementById('fieldCaptcha').value = "";
}

var postCallback = function requestComplete(status, data) {

  if (status === 'ok') {

    notification('Thread created.');

    window.location.pathname = '/' + boardUri + '/res/' + data + '.html';

  } else {
    notification(status + ': ' + JSON.stringify(data));
  }
};

postCallback.stop = function() {
  postButton.removeAttribute('disabled');
};

function sendThreadData(files) {

  var forcedAnon = !document.getElementById('fieldName');

  var typedName = !forcedAnon ?
    document.getElementById('fieldName').value.trim() : undefined;

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value.trim();

  var hiddenCaptcha = !document.getElementById('captchaDiv');

  var typedCaptcha = !hiddenCaptcha ?
    document.getElementById('fieldCaptcha').value.trim() : undefined;

  if (!typedMessage.length) {
    notification('A message is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    notification('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > 2048) {
    notification('Message is too long, keep it under 2048 characters.');
    return;
  } else if (typedEmail.length > 64) {
    notification('Email is too long, keep it under 64 characters.');
    return;
  } else if (typedSubject.length > 128) {
    notification('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    notification('Password is too long, keep it under 8 characters.');
    return;
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6 &&
             typedCaptcha.length !== 24) {
    notification('Captchas are exactly 6 characters long.\n(or 24 in the case of a no-cookie ID)');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    notification('Invalid captcha.');
    return;
  }

  postButton.setAttribute('disabled', '');

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

function postThread() {
  iterateSelectedFiles(0, [],
                       document.getElementById('files'), sendThreadData);
}
