if (pageId === 'thread') {

  var markPost = function(id) {
    if (isNaN(id)) { return; }

    if (markedPosting && markedPosting.className === 'markedPost') {
      markedPosting.setAttribute('class', 'postCell');
    }

    markedPosting = document.getElementById(id);

    if (markedPosting && markedPosting.className === 'postCell') {
      markedPosting.className += ' markedPost';
    }
  };


  window.boardUri = undefined;
  window.threadId = undefined;
  window.board = false;
  window.replyButton = undefined;
  window.refreshButton = undefined;
  window.lastReplyId = 0;
  window.lastRefreshWaiting = 0;
  window.refreshLabel = undefined;
  window.autoRefresh = undefined;
  window.refreshTimer = undefined;
  window.lastRefresh = undefined;
  window.currentRefresh = undefined;
  window.manualRefresh = undefined;
  window.foundPosts = undefined;
  window.hiddenCaptcha = !document.getElementById('captchaDiv');
  window.markedPosting = undefined;

  /* Outdated, TODO set up built cells insert with gulp-preprocess */
  window.postCellTemplate =
    '<input type="checkbox" class="deletionCheckBox">' +
    '<span class="labelSubject"></span> <a class="linkName"></a> <span class="labelRole">' +
    '</span> <span class="labelCreated"></span><span class="spanId"> Id: <span' +
    ' class="labelId"></span></span> <a class="linkSelf"></a><div class="linkQuote"></div>' +
    '<div class="panelUploads"></div>' +
    '<div class="divMessage" /></div><div class="divBanMessage"></div><br>';

  window.uploadCellTemplate = '<a class="nameLink"></a>(<span class="infoLabel"> </span>)<br><a class="imgLink"></a>';

  window.sizeOrders = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

  window.guiEditInfo = 'Edited last time by {$login} on {$date}.';

  boardUri = document.getElementById('boardIdentifier').value;
  window.divPosts = document.getElementsByClassName('divPosts')[0];

  showElement(document.getElementsByClassName('divRefresh')[0]);

  refreshLabel = document.getElementById('labelRefresh');

  refreshButton = document.getElementById('refreshButton');

  threadId = document.getElementsByClassName('opCell')[0].id;

  if (document.getElementById('controlThreadIdentifier')) {
    showElement(document.getElementById('settingsJsButton'));
    removeElement(document.getElementById('settingsFormButton'));
  }

  replyButton = document.getElementById('jsButton');
  showElement(replyButton);

  if (document.getElementById('captchaDiv')) {
    showElement(document.getElementById('reloadCaptchaButton'));
  }

  removeElement(document.getElementById('formButton'));

  window.replies = document.getElementsByClassName('postCell');

  if (replies && replies.length) {
    lastReplyId = replies[replies.length - 1].id;
  }

  var hash = window.location.hash.substring(1);

  if (hash.indexOf('q') === 0 && hash.length > 1) {
    document.getElementById('fieldMessage').value = '>>' +
      hash.substring(1);
  } else if (hash.length > 1) {
    markPost(hash);
  }
}
