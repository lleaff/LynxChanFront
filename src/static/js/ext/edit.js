if (pageId === 'edit') {
  var boardIdentifier;
  var threadIdentififer;
  var postIdentifier;

  showElement(document.getElementById('saveJsButton'));
  removeElement(document.getElementById('saveFormButton'));

  boardIdentifier = document.getElementById('boardIdentifier').value;

  var threadElement = document.getElementById('threadIdentifier');
  if (threadElement) {
    threadIdentififer = threadElement.value;
  } else {
    postIdentifier = document.getElementById('postIdentifier').value;
  }

  var save = function() {

    var typedMessage = document.getElementById('fieldMessage').value.trim();

    if (!typedMessage.length) {
      notification('A message is mandatory.');
    } else if (typedMessage.length > 2048) {
      notification('Message too long, keep it under 2048 characters.');
    } else {

      var parameters = {
        boardUri : boardIdentifier,
        message : typedMessage
      };

      if (postIdentifier) {
        parameters.postId = postIdentifier;
      } else {
        parameters.threadId = threadIdentififer;
      }

      apiRequest('saveEdit',
                 parameters,
                 function requestComplete(status, data) {
        if (status === 'ok') {
          notification('Posting edited.');
        } else {
          notification(status + ': ' + JSON.stringify(data));
        }
      });

    }

  };


}
