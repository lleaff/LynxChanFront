if (!DISABLE_JS) {
  document.getElementById('logoutJsButton').style.display = 'inline';
  document.getElementById('newBoardJsButton').style.display = 'inline';
  document.getElementById('saveJsButton').style.display = 'inline';
  document.getElementById('passwordJsButton').style.display = 'inline';

  document.getElementById('passwordFormButton').style.display = 'none';
  document.getElementById('saveFormButton').style.display = 'none';
  document.getElementById('logoutFormButton').style.display = 'none';
  document.getElementById('newBoardFormButton').style.display = 'none';
}

function logout() {

  document.cookie = 'login=invalid+login';
  document.cookie = 'hash=invalid+hash';

  window.location.pathname = '/login.html';

}

function changePassword() {

  var typedPassword = document.getElementById('fieldPassword').value;
  var typedNewPassword = document.getElementById('fieldNewPassword').value;
  var typedConfirmation = document.getElementById('fieldConfirmation').value;

  if (!typedPassword.length) {
    alert('You must provide your current password.');
  } else if (typedConfirmation !== typedNewPassword) {
    alert('Password confirmation does no match')
  } else if (!typedNewPassword.length) {
    alert('You cannot provide a blank password.');
  } else {
    apiRequest('changeAccountPassword', {
      password : typedPassword,
      newPassword : typedNewPassword,
      confirmation : typedConfirmation
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Password changed.');

        location.reload(true);

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }

}

function save() {

  var typedEmail = document.getElementById('emailField').value.trim();

  if (typedEmail.length > 64) {
    alert('Email too long, keep it under 64 characters');
  } else {

    apiRequest('changeAccountSettings', {
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Settings changed.');

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

}

function createBoard() {

  var typedUri = document.getElementById('newBoardFieldUri').value.trim();
  var typedName = document.getElementById('newBoardFieldName').value.trim();
  var typedDescription = document.getElementById('newBoardFieldDescription').value
      .trim();

  if (!typedUri.length || !typedName.length || !typedDescription.length) {
    alert('All fields are mandatory.');
  } else if (/\W/.test(typedUri)) {
    alert('Invalid uri.');
    return;
  } else {
    apiRequest('createBoard', {
      boardUri : typedUri,
      boardName : typedName,
      boardDescription : typedDescription
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Board created.');

        window.location.pathname = '/' + typedUri + '/';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }

}