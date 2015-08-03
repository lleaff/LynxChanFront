var settingsRelation = {
  checkboxAlwaysSign : 'alwaysSignRole'
};

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
    notification('You must provide your current password.');
  } else if (typedConfirmation !== typedNewPassword) {
    notification('Password confirmation does no match');
  } else if (!typedNewPassword.length) {
    notification('You cannot provide a blank password.');
  } else {
    apiRequest('changeAccountPassword', {
      password : typedPassword,
      newPassword : typedNewPassword,
      confirmation : typedConfirmation
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        notification('Password changed.');

        location.reload(true);

      } else {
        notification(status+': '+JSON.stringify(data));
      }
    });
  }

}

function save() {
  var selectedSettings = [];

  for (var key in settingsRelation) {
    if (document.getElementById(key).checked) {
      selectedSettings.push(settingsRelation[key]);
    }
  }

  var emailField = document.getElementById('emailField');

  var typedEmail = emailField.value.trim();

  if (emailField.validity && emailField.validity.valid === false) {
    notification('Please enter a valid email address');
  } else if (typedEmail.length > 64) {
    notification('Email too long, keep it under 64 characters');
  } else {
    apiRequest('changeAccountSettings', {
      email : typedEmail,
      settings : selectedSettings
    }, function requestComplete(status, data) {
      if (status === 'ok') {
        notification('Settings changed.');
      } else {
        notification(status+': '+JSON.stringify(data));
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
    notification('All fields are mandatory.');
  } else if (/\W/.test(typedUri)) {
    notification('Invalid uri.');
    return;
  } else {
    apiRequest('createBoard', {
      boardUri : typedUri,
      boardName : typedName,
      boardDescription : typedDescription
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        notification('Board created.');

        window.location.pathname = '/'+typedUri+'/';

      } else {
        notification(status+': '+JSON.stringify(data));
      }
    });
  }

}
