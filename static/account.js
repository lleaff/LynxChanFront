if (!DISABLE_JS) {
  document.getElementById('logoutJsButton').style.display = 'inline';
  document.getElementById('newBoardJsButton').style.display = 'inline';

  document.getElementById('logoutFormButton').style.display = 'none';
  document.getElementById('newBoardFormButton').style.display = 'none';
}

function logout() {

  document.cookie = 'login=invalid+login';
  document.cookie = 'hash=invalid+hash';

  window.location.pathname = '/login.html';

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