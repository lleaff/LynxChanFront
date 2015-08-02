function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';

  document.getElementById('captchaImage').src = '/captcha.js#'+
    new Date().toString();
  /* Clear the text field */
  document.getElementById('fieldCaptcha').value = "";
}

function saveThreadSettings() {

  apiRequest('changeThreadSettings', {
    boardUri: boardUri,
    threadId: threadId,
    pin:      document.getElementById('checkboxPin').checked,
    lock:     document.getElementById('checkboxLock').checked,
    cyclic:   document.getElementById('checkboxCyclic').checked
  }, function setLock(status, data) {

    if (status === 'ok') {

      alert('Settings saved.');

      location.reload(true);

    } else {
      alert(status+': '+JSON.stringify(data));
    }
  });

}

if (pageId === 'thread') {
  changeRefresh();

  var replyCallback = function(status, data) {

    if (status === 'ok') {
      replySuccessful();
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  };

  replyCallback.stop = function() {
    replyButton.removeAttribute('disabled');

    if (!hiddenCaptcha) {
      reloadCaptcha();
      document.getElementById('fieldCaptcha').value = '';
    }
  };
}

function replySuccessful() {
  /* Reset fields */
  document.getElementById('fieldMessage').value = '';
  document.getElementById('fieldSubject').value = '';
  document.getElementById('files').value = '';

  setTimeout(function() {
    refreshPosts();
  }, 2000);
}

/* =Reply DOM building
------------------------------------------------------------*/
function padDateField(value) {
  if (value < 10) {
    value = '0' + value;
  }

  return value;
}

function formatDateToDisplay(d) {
  var day = padDateField(d.getDate());
  var weekDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
  var month = padDateField(d.getMonth()+1);
  var year = d.getFullYear();
  var weekDay = weekDays[d.getDay()];
  var hour = padDateField(d.getHours());
  var minute = padDateField(d.getMinutes());
  var second = padDateField(d.getSeconds());
  var toReturn = month+'/'+day+'/'+year;

  return toReturn+' ('+weekDay+') '+hour+':'+minute+':'+second;
}

function formatFileSize(size) {
  var orderIndex = 0;

  while (orderIndex < sizeOrders.length - 1 && size > 1024) {
    orderIndex++;
    size /= 1024;
  }

  return size.toFixed(2)+' '+sizeOrders[orderIndex];
}

function setLastEditedLabel(post, cell) {
  var editedLabel = cell.getElementsByClassName('labelLastEdit')[0];

  if (post.lastEditTime) {
    var formatedDate = formatDateToDisplay(new Date(post.lastEditTime));

    editedLabel.innerHTML = guiEditInfo.replace('{$date}', formatedDate)
      .replace('{$login}', post.lastEditLogin);
  } else {
    removeElement(editedLabel);
  }

}

function setUploadLinks(cell, file) {
  var thumbLink = cell.getElementsByClassName('imgLink')[0];
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

    var sizeString = formatFileSize(file.size);
    cell.getElementsByClassName('sizeLabel')[0].innerHTML = sizeString;

    var dimensionLabel = cell.getElementsByClassName('dimensionLabel')[0];

    if (file.width) {
      dimensionLabel.innerHTML = file.width + 'x' + file.height;
    } else {
      removeElement(dimensionLabel);
    }

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

  setLastEditedLabel(post, postCell);

}

function setPostComplexElements(postCell, post, boardUri, threadId) {
  var labelRole = postCell.getElementsByClassName('labelRole')[0];

  if (post.signedRole) {
    labelRole.innerHTML = post.signedRole;
  } else {
    labelRole.parentNode.removeChild(labelRole);
  }

  var link = postCell.getElementsByClassName('linkSelf')[0];
  var linkQuote = postCell.getElementsByClassName('linkQuote')[0];
  linkQuote.innerHTML = post.postId;
  linkQuote.href = '/'+boardUri+'res'+threadId+'.html#q'+post.postId;

  var deletionCheckbox =
    postCell.getElementsByClassName('deletionCheckBox')[0];

  link.href = '/'+boardUri+'/res/'+threadId+'.html#'+post.postId;

  var checkboxName = boardUri+'-'+threadId+'-'+post.postId;
  deletionCheckbox.setAttribute('name', checkboxName);

  setUploadCell(
    postCell.getElementsByClassName('panelUploads')[0], post.files);
}

function setPostInnerElements(boardUri, threadId, post, postCell) {
  var linkName = postCell.getElementsByClassName('linkName')[0];

  linkName.innerHTML = post.name;

  if (post.email) {
    linkName.href = 'mailto:'+post.email;
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

  if (post.files && post.files.length > 1) {
    postCell.className += ' multipleUploads';
  }

  postCell.id = post.postId;
  postCell.setAttribute('class', 'postCell');

  setPostInnerElements(boardUri, threadId, post, postCell);

  var imageLinkElements = postCell.getElementsByClassName('imgLink');
  var imageLinks = [];
  for (var i = 0; i < imageLinkElements.length; ++i) {
    imageLinks[i] = imageLinkElements[i];
    processImageLink(imageLinks[i]);
  }

  divPosts.appendChild(postCell);

  var quotes = postCell.getElementsByClassName('quoteLink');
  for (i = 0; i < quotes.length; ++i) {
    var quote = quotes[i];
    processQuote(quote);
  }

  processPostingQuote(postCell.getElementsByClassName('linkQuote')[0]);
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

if (pageId === 'thread') {
  refreshCallback.stop = function() {
    showElement(refreshButton);
  };
}

function refreshPosts(manual) {
  manualRefresh = manual;

  if (autoRefresh) {
    clearInterval(refreshTimer);
  }

  refreshButton.style.display = 'none';

  localRequest('/'+boardUri+'/res/'+threadId+'.json', refreshCallback);

}

function sendReplyData(files) {
  var forcedAnon = !document.getElementById('fieldName');

  var typedName = !forcedAnon &&
    document.getElementById('fieldName').value.trim();

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value.trim();

  var threadId = document.getElementById('threadIdentifier').value;

  var typedCaptcha = !hiddenCaptcha && 
    document.getElementById('fieldCaptcha').value.trim();

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
  } else if (typedSubject.length > 128) {
    alert('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    alert('Password is too long, keep it under 8 characters.');
    return;
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6 &&
             typedCaptcha.length !== 24) {
    alert('Captchas are exactly 6 characters long.\n(or 24 in the case of a no-cookie ID)');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  }

  replyButton.setAttribute('disabled', '');

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

function postReply() {
  iterateSelectedFiles(0, [], document.getElementById('files'), sendReplyData);
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

if (pageId === 'thread') {
  var postingQuotes = document.getElementsByClassName('linkQuote');

  for (var i = 0; i < postingQuotes.length; i++) {
    processPostingQuote(postingQuotes[i]);
  }
}

function processPostingQuote(link) {
  link.onclick = function() {
    var toQuote = link.href.match(/#q(\d+)/);

    document.getElementById('fieldMessage').value += '>>'+toQuote[1];
  };
}
