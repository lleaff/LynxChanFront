if (!DISABLE_JS) {
  document.getElementById('addJsButton').style.display = 'block';

  document.getElementById('addFormButton').style.display = 'none';

  var staffDiv = document.getElementById('divStaff');

  for (var i = 0; i < staffDiv.childNodes.length; i++) {
    var cell = staffDiv.childNodes[i];

    processCell(cell);

  }

}

function processCell(cell) {
  var button;
  var comboBox;
  var user;

  for (var j = 0; j < cell.childNodes.length; j++) {
    var node = cell.childNodes[j];

    switch (node.id) {
    case 'saveJsButton':
      button = node;
      node.style.display = 'block';
      break;
    case 'saveFormButton':
      node.style.display = 'none';
      break;
    case 'userIdentifier':
      user = node.value;
      break;
    case 'roleCombo':
      comboBox = node;
      break;
    }

  }

  button.onclick = function() {
    saveUser(user, comboBox);
  };
}

function saveUser(user, comboBox) {

  setUser(user, comboBox.options[comboBox.selectedIndex].value);

}

function addUser() {

  var combo = document.getElementById('newStaffCombo');

  setUser(document.getElementById('fieldLogin').value.trim(),
      combo.options[combo.selectedIndex].value);

}

function setUser(login, role) {

  apiRequest('setGlobalRole', {
    login : login,
    role : +role
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/globalManagement.js';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}
