var newThreadCallback = function requestComplete(status, data) {
  if (status === 'ok') {
    success('Thread created.');
    window.location.pathname = '/' + boardUri + '/res/' + data + '.html';
  } else {
    notification(status + ': ' + JSON.stringify(data));
  }
};

newThreadCallback.stop = function() {
  postButton.removeAttribute('disabled');
};

function sendThreadData(files) {
  sendPostData(files, false);
}

function postThread() {
  iterateSelectedFiles(0, [],
                       document.getElementById('files'), sendThreadData);
}
