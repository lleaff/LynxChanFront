if (pageId === 'thread') {
  bodyOnLoadStack.push(function() {

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

    var postCellTemplate =
      '<input type="checkbox" class="deletionCheckBox">' +
      '<span class="labelSubject"></span> <a class="linkName"></a> <span class="labelRole">' +
      '</span> <span class="labelCreated"></span><span class="spanId"> Id: <span' +
      ' class="labelId"></span></span> <a class="linkSelf"></a><div class="linkQuote"></div>' +
      '<div class="panelUploads"></div>' +
      '<div class="divMessage" /></div><div class="divBanMessage"></div><br>';

    var uploadCellTemplate = '<a class="nameLink"></a>(<span class="infoLabel"> </span>)<br><a class="imgLink"></a>';

    var sizeOrders = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

    boardUri = document.getElementById('boardIdentifier').value;
    var divPosts = document.getElementsByClassName('divPosts')[0];

    showElement(document.getElementsByClassName('divRefresh')[0]);

    refreshLabel = document.getElementById('labelRefresh');

    refreshButton = document.getElementById('refreshButton');

    threadId = document.getElementsByClassName('opCell')[0].id;

    if (document.getElementById('controlThreadIdentifier')) {
      showElement(document.getElementById('settingsJsButon'));
      removeElement(document.getElementById('settingsFormButon'));
    }

    replyButton = document.getElementById('jsButton');
    showElement(replyButton);

    if (document.getElementById('captchaDiv')) {
      showElement(document.getElementById('reloadCaptchaButton'));
    }

    removeElement(document.getElementById('formButton'));

    var replies = document.getElementsByClassName('postCell');

    if (replies && replies.length) {
      lastReplyId = replies[replies.length - 1].id;
    }

    changeRefresh();

    var hash = window.location.hash.substring(1);

    if (hash.indexOf('q') === 0 && hash.length > 1) {
      document.getElementById('fieldMessage').value = '>>' +
        hash.substring(1);
    } else if (hash.length > 1) {
      markPost(hash);
    }

  });
}
