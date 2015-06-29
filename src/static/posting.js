var loadedPreviews = [];
var loadingPreviews = [];
var quoteReference = {};

if (!DISABLE_JS) {

  document.getElementById('deleteJsButton').style.display = 'inline';
  document.getElementById('reportJsButton').style.display = 'inline';

  if (!board && document.getElementById('inputBan')) {

    document.getElementById('banJsButton').style.display = 'inline';

    document.getElementById('inputBan').style.display = 'none';
  }

  document.getElementById('reportFormButton').style.display = 'none';
  document.getElementById('deleteFormButton').style.display = 'none';

  var quotes = document.getElementsByClassName('quoteLink');

  for (var i = 0; i < quotes.length; i++) {
    var quote = quotes[i];

    processQuote(quote);
  }

}

function processQuote(quote) {

  var rect = quote.getBoundingClientRect();

  var previewOrigin = {
    x : rect.right + 10 + window.scrollX,
    y : rect.top + window.scrollY
  };

  var tooltip = document.createElement('div');
  tooltip.style.display = 'none';
  quote.parentNode.appendChild(tooltip);
  tooltip.innerHTML = 'Loading';
  tooltip.style['background-color'] = '#cccccc';

  tooltip.style.position = 'absolute';
  tooltip.style.left = previewOrigin.x + 'px';
  tooltip.style.top = previewOrigin.y + 'px';

  var quoteUrl = quote.href;

  var referenceList = quoteReference[quoteUrl] || [];

  referenceList.push(tooltip);

  quoteReference[quoteUrl] = referenceList;

  quote.onmouseenter = function() {
    tooltip.style.display = 'inline';

    if (loadedPreviews.indexOf(quoteUrl) < 0
        && loadingPreviews.indexOf(quoteUrl) < 0) {
      loadQuote(tooltip, quoteUrl);
    }

  };

  quote.onmouseout = function() {
    tooltip.style.display = 'none';
  };

}

function loadQuote(tooltip, quoteUrl) {

  var matches = quoteUrl.match(/\/(\w+)\/res\/\d+\.html\#(\d+)/);

  var board = matches[1];
  var post = matches[2];

  var previewUrl = '/' + board + '/preview/' + post + '.html';

  localRequest(previewUrl, function receivedData(error, data) {
    if (error) {
      loadingPreviews.splice(loadingPreviews.indexOf(quoteUrl), 1);
    } else {

      var referenceList = quoteReference[quoteUrl];

      for (var i = 0; i < referenceList.length; i++) {
        referenceList[i].innerHTML = data;

      }

      loadedPreviews.push(quoteUrl);
      loadingPreviews.splice(loadingPreviews.indexOf(quoteUrl), 1);
    }
  });

  loadingPreviews.push(quoteUrl);

}

function banPosts() {
  var typedReason = document.getElementById('reportFieldReason').value.trim();
  var typedExpiration = document.getElementById('fieldExpiration').value.trim();
  var typedMessage = document.getElementById('fieldbanMessage').value.trim();

  var expiration = Date.parse(typedExpiration || '');

  if (isNaN(expiration)) {
    alert('Invalid expiration');

    return;
  }

  var toBan = getSelectedContent();

  apiRequest('banUsers', {
    reason : typedReason,
    expiration : typedExpiration,
    banMessage : typedMessage,
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