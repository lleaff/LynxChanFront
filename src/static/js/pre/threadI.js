if (pageId === 'thread') {
  bodyOnLoadStack.push(function() {

    var boardUri;
    var threadId;
    var board = false;
    var replyButton;
    var refreshButton;
    var lastReplyId = 0;
    var lastRefreshWaiting = 0;
    var refreshLabel;
    var autoRefresh;
    var refreshTimer;
    var lastRefresh;
    var currentRefresh;
    var manualRefresh;
    var foundPosts;
    var hiddenCaptcha = !document.getElementById('captchaDiv');

    var postCellTemplate = '<input type="checkbox" class="deletionCheckBox">' +
      ' <span class="labelSubject"></span> <a class="linkName"></a> <span class="labelRole">' +
      '</span> <span class="labelCreated"></span><span class="spanId"> Id: <span' +
      ' class="labelId"></span></span> <a class="linkSelf"></a><div class="panelUploads"></div>' +
      '<div class="divMessage" /></div><div class="divBanMessage"></div><br>';

    var uploadCellTemplate = '<a class="nameLink"></a>(<span class="infoLabel"> </span>)<br><a class="imageLink"></a>';

    var sizeOrders = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

    boardUri = document.getElementById('boardIdentifier').value;
    var divPostings = document.getElementById('divPostings');

    document.getElementsByClassName('divRefresh')[0].style.display = 'inline';

    refreshLabel = document.getElementById('labelRefresh');

    refreshButton = document.getElementById('refreshButton');

    threadId = document.getElementsByClassName('opCell')[0].id;

    if (document.getElementById('controlThreadIdentifier')) {
      document.getElementById('settingsJsButon').style.display = 'inline';
      document.getElementById('settingsFormButon').style.display = 'none';
    }

    replyButton = document.getElementById('jsButton');
    replyButton.style.display = '';

    if (document.getElementById('captchaDiv')) {
      document.getElementById('reloadCaptchaButton').style.display = '';
    }

    document.getElementById('formButton').style.display = 'none';

    var replies = document.getElementsByClassName('postCell');

    if (replies && replies.length) {
      lastReplyId = replies[replies.length - 1].id;
    }

    changeRefresh();

  });
}