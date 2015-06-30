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

var postCellTemplate = '<input type="checkbox" class="deletionCheckBox">'
    + ' <span class="labelSubject"></span> <a class="linkName"></a> <span class="labelRole">'
    + '</span> <span class="labelCreated"></span><span class="spanId"> Id: <span'
    + ' class="labelId"></span></span> <a class="linkSelf"></a><div class="panelUploads"></div>'
    + '<div class="divMessage" /></div><div class="divBanMessage"></div><br>';

var uploadCellTemplate = '<a class="nameLink"></a>(<span class="infoLabel"> </span>)<br><a class="imageLink"></a>';

var sizeOrders = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

if (!DISABLE_JS) {

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
  replyButton.style.display = 'inline';

  if (document.getElementById('captchaDiv')) {
    document.getElementById('reloadCaptchaButton').style.display = 'inline';
  }

  document.getElementById('formButton').style.display = 'none';

  var replies = document.getElementsByClassName('postCell');

  if (replies && replies.length) {
    lastReplyId = replies[replies.length - 1].id;
  }

  changeRefresh();

}

function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';
  document.getElementById('captchaImage').src = '/captcha.js#'
      + new Date().toString();

}

function saveThreadSettings() {

  apiRequest('changeThreadSettings', {
    boardUri : boardUri,
    threadId : threadId,
    pin : document.getElementById('checkboxPin').checked,
    lock : document.getElementById('checkboxLock').checked
  }, function setLock(status, data) {

    if (status === 'ok') {

      alert('Settings saved.');

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

var replyCallback = function(status, data) {

  if (status === 'ok') {
    document.getElementById('fieldMessage').value = '';
    document.getElementById('fieldSubject').value = '';

    setTimeout(function() {
      refreshPosts();
    }, 2000);
  } else {
    alert(status + ': ' + JSON.stringify(data));
  }
};

replyCallback.stop = function() {
  replyButton.style.display = 'inline';

  if (!hiddenCaptcha) {
    reloadCaptcha();
    document.getElementById('fieldCaptcha').value = '';
  }
};

function padDateField(value) {
  if (value < 10) {
    value = '0' + value;
  }

  return value;
}

function formatDateToDisplay(d) {
  var day = padDateField(d.getDate());

  var weekDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

  var month = padDateField(d.getMonth() + 1);

  var year = d.getFullYear();

  var weekDay = weekDays[d.getDay()];

  var hour = padDateField(d.getHours());

  var minute = padDateField(d.getMinutes());

  var second = padDateField(d.getSeconds());

  var toReturn = month + '/' + day + '/' + year;

  return toReturn + ' (' + weekDay + ') ' + hour + ':' + minute + ':' + second;
}

function formatFileSize(size) {

  var orderIndex = 0;

  while (orderIndex < sizeOrders.length - 1 && size > 1024) {

    orderIndex++;
    size /= 1024;

  }

  return size.toFixed(2) + ' ' + sizeOrders[orderIndex];

}

function setUploadLinks(cell, file) {
  var thumbLink = cell.getElementsByClassName('imageLink')[0];
  thumbLink.href = file.path;

  var img = document.createElement('img');
  img.src = file.thumb;

  thumbLink.appendChild(img);

  var nameLink = cell.getElementsByClassName('nameLink')[0];
  nameLink.href = file.path;
  nameLink.innerHTML = file.name;
}

function setUploadCell(node, files) {

  if (!files) {
    return;
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var cell = document.createElement('div');
    cell.innerHTML = uploadCellTemplate;
    cell.setAttribute('class', 'uploadCell');

    setUploadLinks(cell, file);

    var infoString = formatFileSize(file.size);

    if (file.width) {
      infoString += ', ' + file.width + 'x' + file.height;
    }

    cell.getElementsByClassName('infoLabel')[0].innerHTML = infoString;

    node.appendChild(cell);
  }

}

function setPostHideableElements(postCell, post) {
  var subjectLabel = postCell.getElementsByClassName('labelSubject')[0];
  if (post.subject) {
    subjectLabel.innerHTML = post.subject;
  } else {
    subjectLabel.parentNode.removeChild(subjectLabel);
  }

  if (post.id) {
    postCell.getElementsByClassName('labelId')[0].innerHTML = post.id;
  } else {
    var spanId = postCell.getElementsByClassName('spanId')[0];
    spanId.parentNode.removeChild(spanId);
  }

  var banMessageLabel = postCell.getElementsByClassName('divBanMessage')[0];

  if (!post.banMessage) {
    banMessageLabel.parentNode.removeChild(banMessageLabel);
  } else {
    banMessageLabel.innerHTML = post.banMessage;
  }

}

function setPostComplexElements(postCell, post, boardUri, threadId) {

  var labelRole = postCell.getElementsByClassName('labelRole')[0];

  if (post.signedRole) {
    labelRole.innerHTML = post.signedRole;
  } else {
    labelRole.parentNode.removeChild(labelRole);
  }

  var link = postCell.getElementsByClassName('linkSelf')[0];
  link.innerHTML = post.postId;

  var deletionCheckbox = postCell.getElementsByClassName('deletionCheckBox')[0];

  link.href = '/' + boardUri + '/res/' + threadId + '.html#' + post.postId;

  var checkboxName = boardUri + '-' + threadId + '-' + post.postId;
  deletionCheckbox.setAttribute('name', checkboxName);

  setUploadCell(postCell.getElementsByClassName('panelUploads')[0], post.files);
}

function setPostInnerElements(boardUri, threadId, post, postCell) {

  var linkName = postCell.getElementsByClassName('linkName')[0];

  linkName.innerHTML = post.name;

  if (post.email) {
    linkName.href = 'mailto:' + post.email;
  } else {
    linkName.className += ' noEmailName';
  }

  var labelCreated = postCell.getElementsByClassName('labelCreated')[0];

  labelCreated.innerHTML = formatDateToDisplay(new Date(post.creation));

  postCell.getElementsByClassName('divMessage')[0].innerHTML = post.markdown;

  setPostHideableElements(postCell, post);

  setPostComplexElements(postCell, post, boardUri, threadId);
}

function addPost(post) {

  var postCell = document.createElement('div');
  postCell.innerHTML = postCellTemplate;

  postCell.id = post.postId;
  postCell.setAttribute('class', 'postCell');

  setPostInnerElements(boardUri, threadId, post, postCell);

  divPostings.appendChild(postCell);
}

var refreshCallback = function(error, data) {

  if (error) {
    return;
  }

  var receivedData = JSON.parse(data);

  var posts = receivedData.posts;

  foundPosts = false;

  if (posts && posts.length) {
    var lastPost = posts[posts.length - 1];

    if (lastPost.postId > lastReplyId) {
      foundPosts = true;

      for (var i = 0; i < posts.length; i++) {

        var post = posts[i];

        if (post.postId > lastReplyId) {
          addPost(post);
          lastReplyId = post.postId;
        }

      }
    }
  }

  if (autoRefresh) {
    startTimer(manualRefresh || foundPosts ? 5 : lastRefresh * 2);
  }

};

refreshCallback.stop = function() {
  refreshButton.style.display = 'inline';

};

function refreshPosts(manual) {

  manualRefresh = manual;

  if (autoRefresh) {
    clearInterval(refreshTimer);
  }

  refreshButton.style.display = 'none';

  localRequest('/' + boardUri + '/res/' + threadId + '.json', refreshCallback);

}

function sendReplyData(files) {

  var forcedAnon = !document.getElementById('fieldName');

  if (!forcedAnon) {
    var typedName = document.getElementById('fieldName').value.trim();
  }

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value.trim();

  var threadId = document.getElementById('threadIdentifier').value;

  if (!hiddenCaptcha) {
    var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();
  }

  if (!typedMessage.length) {
    alert('A message is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    alert('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > 2048) {
    alert('Message is too long, keep it under 2048 characters.');
    return;
  } else if (typedEmail.length > 64) {
    alert('Email is too long, keep it under 64 characters.');
    return;
  } else if (typedSubject.length > 32) {
    alert('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    alert('Password is too long, keep it under 8 characters.');
    return;
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6
      && typedCaptcha.length !== 24) {
    alert('Captchas are exactly 6 (24 if no cookies) characters long.');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  replyButton.style.display = 'none';

  apiRequest('replyThread', {
    name : forcedAnon ? null : typedName,
    captcha : hiddenCaptcha ? null : typedCaptcha,
    subject : typedSubject,
    spoiler : document.getElementById('checkboxSpoiler').checked,
    password : typedPassword,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri,
    threadId : threadId
  }, replyCallback);

}

function iterateSelectedFiles(currentIndex, files, fileChooser) {

  if (currentIndex < fileChooser.files.length) {
    var reader = new FileReader();

    reader.onloadend = function(e) {

      files.push({
        name : fileChooser.files[currentIndex].name,
        content : reader.result
      });

      iterateSelectedFiles(currentIndex + 1, files, fileChooser);

    };

    reader.readAsDataURL(fileChooser.files[currentIndex]);
  } else {
    sendReplyData(files);
  }

}

function postReply() {

  iterateSelectedFiles(0, [], document.getElementById('files'));
}

function startTimer(time) {

  currentRefresh = time;
  lastRefresh = time;
  labelRefresh.innerHTML = currentRefresh;
  refreshTimer = setInterval(function checkTimer() {
    currentRefresh--;

    if (!currentRefresh) {
      clearInterval(refreshTimer);
      refreshPosts();
      labelRefresh.innerHTML = '';
    } else {
      labelRefresh.innerHTML = currentRefresh;
    }

  }, 1000);
}

function changeRefresh() {

  if (autoRefresh) {
    labelRefresh.innerHTML = '';
    clearInterval(refreshTimer);
  } else {
    startTimer(5);
  }

  autoRefresh = !autoRefresh;

}
