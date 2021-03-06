if (pageId === 'boardModeration') {

  var boardIdentifier;

  document.getElementById('transferJsButton').style.display = 'inline';
  document.getElementById('deleteJsButton').style.display = 'inline';

  document.getElementById('deleteFormButton').style.display = 'none';
  document.getElementById('transferFormButton').style.display = 'none';

  boardIdentifier = document.getElementById('boardTransferIdentifier').value;

}

function transferBoard() {

  apiRequest('transferBoardOwnership', {
    login : document.getElementById('fieldTransferLogin').value.trim(),
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/' + boardIdentifier + '/';

    } else {
      notification(status + ': ' + JSON.stringify(data));
    }
  });

}

function deleteBoard() {
  apiRequest('deleteBoard', {
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/';

    } else {
      notification(status + ': ' + JSON.stringify(data));
    }
  });

}
