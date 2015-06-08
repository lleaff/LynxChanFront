var boardIdentifier;

if (!DISABLE_JS) {
  document.getElementById('addVolunteerJsButton').style.display = 'inline';
  document.getElementById('transferBoardJsButton').style.display = 'inline';
  document.getElementById('deleteBoardJsButton').style.display = 'inline';

  document.getElementById('deleteBoardFormButton').style.display = 'none';
  document.getElementById('addVolunteerFormButton').style.display = 'none';
  document.getElementById('transferBoardFormButton').style.display = 'none';

  boardIdentifier = document.getElementById('addVolunteerBoardIdentifier').value;

  var volunteerDiv = document.getElementById('volunteersDiv');

  for (var i = 0; i < volunteerDiv.childNodes.length; i++) {
    processVolunteerCell(volunteerDiv.childNodes[i]);

  }

  setupReportButtons();

}

function processVolunteerCell(cell) {
  var button = cell.getElementsByClassName('removeJsButton')[0];
  button.style.display = 'inline';
  cell.getElementsByClassName('removeFormButton')[0].style.display = 'none';

  button.onclick = function() {
    setVolunteer(cell.getElementsByClassName('userIdentifier')[0].value, false);
  };

}

function addVolunteer() {
  setVolunteer(document.getElementById('addVolunteerFieldLogin').value.trim(),
      true);
}

function setVolunteer(user, add) {

  apiRequest('setVolunteer', {
    login : user,
    add : add,
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function transferBoard() {

  apiRequest('transferBoardOwnership', {
    login : document.getElementById('transferBoardFieldLogin').value.trim(),
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/' + boardIdentifier + '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
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
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}