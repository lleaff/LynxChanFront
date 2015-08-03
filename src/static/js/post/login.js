function recoverAccount() {

  var typedLogin = document.getElementById('recoverFieldLogin').value.trim();

  if (typedLogin.length) {

    apiRequest('requestAccountRecovery', {
      login : typedLogin
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        notification('Password request created. Check your e-mail.');

      } else {
        notification(status + ': ' + JSON.stringify(data));
      }
    });

  }

}

function loginUser() {

  var typedLogin = document.getElementById('loginFieldLogin').value.trim();
  var typedPassword = document.getElementById('loginFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    notification('Both login and password are mandatory.');
  } else {
    apiRequest('login', {
      login : typedLogin,
      password : typedPassword
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        document.cookie = 'login=' + typedLogin;
        document.cookie = 'hash=' + data;

        window.location.pathname = '/account.js';

      } else {
        notification(status + ': ' + JSON.stringify(data));
      }
    });
  }
}

function registerAccount() {

  var typedLogin = document.getElementById('registerFieldLogin').value.trim();
  var typedEmail = document.getElementById('registerFieldEmail').value.trim();
  var typedPassword = document.getElementById('registerFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    notification('Both login and password are mandatory.');
  } else if (typedLogin.length > 16) {
    notification('Login too long, keep it under 16 characters');
  } else if (typedEmail.length > 64) {
    notification('Email too long, keep it under 64 characters');
  } else if (/\W/.test(typedLogin)) {
    notification('Invalid login.');
  } else {

    apiRequest('registerAccount', {
      login : typedLogin,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        document.cookie = 'login=' + typedLogin;
        document.cookie = 'hash=' + data;

        window.location.pathname = '/account.js';

      } else {
        notification(status + ': ' + JSON.stringify(data));
      }
    });

  }

}
