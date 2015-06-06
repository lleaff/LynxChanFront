var checkBoxes = [];

if (!DISABLE_JS) {

  document.getElementById('deleteJsButton').style.display = 'block';

  document.getElementById('deleteFormButton').style.display = 'none';

  var divPostings = document.getElementById('divPostings');

  for (var i = 0; i < divPostings.childNodes.length; i++) {

    processPostingCell(divPostings.childNodes[i]);

  }

}

function processPostingCell(postingCell) {

  for (var i = 0; i < postingCell.childNodes.length; i++) {
    var node = postingCell.childNodes[i];

    if (node.id === 'deletionCheckBox') {
      checkBoxes.push(node);
    }
  }

}

function deletePosts() {
  var typedPassword = document.getElementById('deletionFieldPassword').value
      .trim();

  var toDelete = [];

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

      toDelete.push(toAdd);

    }
  }

  apiRequest('deleteContent', {
    password : typedPassword,
    postings : toDelete
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}