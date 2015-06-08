if (!DISABLE_JS) {

  document.getElementById('deleteJsButton').style.display = 'inline';
  document.getElementById('reportJsButton').style.display = 'inline';
  document.getElementById('banJsButton').style.display = 'inline';

  document.getElementById('inputBan').style.display = 'none';
  document.getElementById('reportFormButton').style.display = 'none';
  document.getElementById('deleteFormButton').style.display = 'none';

}

function banPosts() {
  var typedReason = document.getElementById('reportFieldReason').value.trim();
  var typedExpiration = document.getElementById('fieldExpiration').value.trim();

  var expiration = Date.parse(typedExpiration || '');

  if (isNaN(expiration)) {
    alert('Invalid expiration');

    return;
  }

  var toBan = getSelectedContent();

  apiRequest('banUsers', {
    reason : typedReason,
    expiration : typedExpiration,
    global : document.getElementById('checkboxGlobal').checked,
    postings : toBan
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Bans applied');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function getSelectedContent() {
  var selectedContent = [];

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {

      var splitName = checkBox.name.split('-');

      var toAdd = {
        board : splitName[0],
        thread : splitName[1]
      };

      if (splitName.length > 2) {
        toAdd.post = splitName[2];
      }

      selectedContent.push(toAdd);

    }
  }

  return selectedContent;

}

function reportPosts() {

  var typedReason = document.getElementById('reportFieldReason').value.trim();

  var toReport = getSelectedContent();

  apiRequest('reportContent', {
    reason : typedReason,
    global : document.getElementById('checkboxGlobal').checked,
    postings : toReport
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Content reported');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function deletePosts() {

  var typedPassword = document.getElementById('deletionFieldPassword').value
      .trim();

  var toDelete = getSelectedContent();

  apiRequest('deleteContent', {
    password : typedPassword,
    postings : toDelete
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      alert('Content deleted');

      window.location.pathname = '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}