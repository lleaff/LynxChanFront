// @ifdef DEBUG
console.log('posting.js - BEGIN PARSING');//DEBUG
// @endif


/* =Uploads, =Images, =Videos
------------------------------------------------------------*/
function createUploadHideButton(target) {
  var el = document.createElement('button');
  el.setAttribute('class', 'hideButton fa fa-minus-square-o');

  el.hide = function(target) {
    var placeholder = target.placeholder;
    if (placeholder === undefined) {
      placeholder = appendUploadPlaceholder(target);
    }

    target.hide();
    target.thumb.style.display = 'none';

    el.setAttribute('class', 'hideButton fa fa-plus-square');
    target.hidden = true;
  };

  el.show = function(target) {
    el.setAttribute('class', 'hideButton fa fa-minus-square-o');
    target.placeholder.style.display = 'none';
    target.show();
  };

  el.onclick = function() {
    if (target.hidden) { this.hide(); } else { this.show(); }
  };

  return el;
}

function appendUploadPlaceholder(upload) {
  var placeholder = upload.placeholder = document.createElement('div');

  /* eg.: .uploadPlaceholder.video */
  placeholder.setAttribute('class', 'uploadPlaceholder '+upload.type);

  var width = (upload.thumbWidth = upload.thumb.naturalWidth);
  var height = (upload.thumbWidth = upload.thumb.naturalWidth);
  placeholder.setAttribute(
    'style', 'width:'+width+'; height:'+height+'; display: none;');
    var inner = document.createElement('div');
    inner.setAttribute('class', 'uploadPlaceholderInner');
    placeholder.appendChild(inner);

  upload.thumb.appendChild(placeholder);

  upload.placeholder = placeholder;
  return placeholder;
}

/* Call without 'new' */
function newAttachment(link) {
  var mime = getMime(link.href);

  if (mime.indexOf('image/') > -1) {
    return new ImageAttachment(link, mime);
  } else {
    return new VideoAttachment(link, mime);
  }
}

function Attachment(link) {
  /* 'image'|'video'|'audio' */
  this.thumb          = link.getElementsByTagName('img')[0];
  this.thumbSrc       = this.thumb.getAttribute('src');
  this.link           = link;
  /* .uploadCell */
  this.container      = link.parentNode;
  this.maxThumbWidth  = this.container.style.maxWidth;
  this.maxThumbHeight = this.container.style.maxHeight;
  /* status, minimized or expanded */
  this.minimized      = true;

  var mime = getMime(link.href);
  this.mime = mime;

  return this;
}

var ImageAttachment = extend(Attachment, function(link, mime) {
  this.mime = mime;
  this.type = 'image';

  setInteractiveImage(this);
  return this;
});

var VideoAttachment = extend(Attachment, function(link, mime) {
  this.mime = mime;
  /* Correct some filetypes misreporting as video */
  this.type = videoTypes.indexOf(mime) > -1 ? 'video' : 'audio';

  setPlayer(this);
  return this;
});

function toggleImage(event, up) {
  if (up.expandedSrc === up.thumbSrc) {
    if (up.thumb.className.indexOf('imgExpanded') != -1) {
      removeClass(up.thumb, 'imgExpanded');
    } else {
      up.thumb.className += 'imgExpanded';
    }
  } else if (up.minimized) {
    up.expand();
  } else {
    up.minimize();
  }
  return false;
}

Attachment.prototype.toggleExpand = function() {
  if (this.minimized) { this.expand(); } else { this.minimize(); }
};

Attachment.prototype.minimize = function() {
  if (this.expandedSrc === this.thumbSrc) {
    removeClass(this.thumb, 'imgExpanded');
  } else {
  }

  this.expanded.style.display    = 'none';
  this.container.style.maxHeight = this.maxThumbHeight;
  this.container.style.maxWidth  = this.maxThumbWidth;
  this.thumb.style.display       = '';

  this.minimized = true;
};

VideoAttachment.prototype.minimize = function() {
  if (this.expanded.pause) { this.expanded.pause(); }

  this.expanded.style.display    = 'none';
  this.container.style.maxHeight = this.maxThumbHeight;
  this.container.style.maxWidth  = this.maxThumbWidth;
  this.link.style.display        = '';

  this.source.removeAttribute('src'); /* Stop downloading video */

  if (this.minimizeButton) { this.minimizeButton.style.display = 'none'; }

  this.minimized = true;
};

Attachment.prototype.expand = function() {
  if (this.expandedSrc === this.thumbSrc) {
    this.thumb.className += 'imgExpanded';
  } else {
    this.thumb.style.display       = 'none';
    this.container.style.maxHeight = '';
    this.container.style.maxWidth  = '';
    this.expanded.style.display    = '';
  }

  this.minimized = false;
};

VideoAttachment.prototype.expand = function() {
  this.source.setAttribute('src', this.expandedSrc);

  this.link.style.display           = 'none';
  this.container.style.maxHeight    = '';
  this.container.style.maxWidth     = '';
  if (this.minimizeButton) { this.minimizeButton.style.display = ''; }
  this.expanded.style.display       = '';

  this.minimized = false;
};


Attachment.prototype.toggleHide = function() {
  if (this.hidden) { this.show(); } else { this.hide(); }
};

Attachment.prototype.hide = function() {
  if (!this.placeholder) {
    this.placeholder.style.display = '';
  } else {
    appendUploadPlaceholder(this).style.display('');
  }
  this.thumb.style.display = 'none';
  if (this.expanded) { this.expanded.style.display = 'none'; }

  this.hidden = true;
};

Attachment.prototype.show = function() {
  this.placeholder.style.display = 'none';

  if (this.minimized) {
    this.thumb.style.display = '';
  } else {
    this.expanded.style.display = '';


    this.hidden = false;
  }
};

function setInteractiveImage(up) {

  up.link.onclick = function(event) {
    /* If event was fired by middle mouse button or combined with
     * the ctrl key, act as a normal link */
    if (event.which === 2 || event.ctrlKey) { return true; }

    initialImageExpand(event, up);
    return false;
  };

  /* Low priority so doesn't need to be blocking */
  setTimeout(function() {
    var hideButton = createUploadHideButton();
    //TODO actually append hideButton
  }, 0);
}

/* mouseEvent.target -> link */
function initialImageExpand(event, up) {
  /* return: false -> Don't follow link, true -> Follow link */

  /*------ Animation */
  up.thumb.style.opacity = 0.9; /* Immediate feedback, then transition */
  clickAnim(up.thumb, {
    manualUnset: true,
    duration: 400,
    opacity: 0.5
  });

  up.expandedSrc = up.link.href;

  if (up.expandedSrc === up.thumbSrc) {
    up.thumb.className += ' imgExpanded';
  } else {
    up.expanded = document.createElement('img');
    up.expanded.setAttribute('src', up.expandedSrc);
    up.expanded.setAttribute('style', 'display: none;');
    up.expanded.setAttribute('class', 'imgExpanded');
    up.link.appendChild(up.expanded);

    up.expanded.onload = function(e) {
      up.thumb.style.display = 'none';
      up.expanded.style.display = '';
      up.container.style.maxWidth  = '';
      up.container.style.maxHeight = '';
      clickAnim(up.thumb, { unset: true });
    };
  }
  up.minimized = false;

  /* New onclick
  ---------------*/
  up.link.onclick = function(event) {
    /* If event was fired by middle mouse button or combined with
     * the ctrl key, act as a normal link */
    if (event.which === 2 || event.ctrlKey) {
      return true;
    } else {
      up.toggleExpand();
    }
    return false;
  };

  return false;
}

function setPlayer(up) {
  var source = document.createElement('source');
  source.setAttribute('src', up.link.href);
  source.setAttribute('type', up.mime);
  up.expandedSrc = up.link.href;
  up.source = source;

  var video = document.createElement(up.type); /* 'audio'|'video' */
  video.setAttribute('controls', true);
  video.setAttribute('class', 'inlineVideo');
  video.style.display = 'none';
  video.appendChild(source);
  up.expanded = video;

  var videoContainer = document.createElement('span');
  videoContainer.setAttribute('class', 'videoContainer');
  up.videoContainer = videoContainer;

  up.link.onclick = function(event) {
    /* If event was fired by middle mouse button or combined with
     * the ctrl key, act as a normal link */
    if (event.which === 2 || event.ctrlKey) { return true; }

    initialVideoExpand(event, up);

    return false;
};

  videoContainer.appendChild(video);
  up.container.style.maxWidth  = '';
  up.container.style.maxHeight = '';
}


function initialVideoExpand(event, up) {

  /* Minimize button */
  var minimizeButton = document.createElement('div');
  minimizeButton.innerHTML = '';
  minimizeButton.setAttribute('class', 'minimizeButton');
  minimizeButton.onclick = function() {
    up.minimize();
  };
  up.videoContainer.insertBefore(minimizeButton,
                                 up.videoContainer.childNodes[0]);
  up.minimizeButton = minimizeButton;

  up.container.replaceChild(up.videoContainer, up.link);
  up.expanded.style.display = '';
  up.container.style.maxWidth  = up.maxThumbWidth;
  up.container.style.maxHeight = up.maxThumbHeight;
  up.link.style.display = 'none';
  up.container.appendChild(up.link);

  up.link.onclick = function(event) {
    /* If event was fired by middle mouse button or combined with
     * the ctrl key, act as a normal link */
    if (event.which === 2 || event.ctrlKey) { return true; }
    up.expand();
    return false;
  };

  return false;
}





function iterateSelectedFiles(currentIndex, files, fileChooser, callback) {
  if (currentIndex < fileChooser.files.length) {
    var reader = new FileReader();

    reader.onloadend = function(e) {

      files.push({
        name : fileChooser.files[currentIndex].name,
        content : reader.result
      });

      iterateSelectedFiles(currentIndex + 1, files, fileChooser, callback);

    };

    reader.readAsDataURL(fileChooser.files[currentIndex]);
  } else {
    callback(files);
  }

}

if (pageId === 'board' || pageId === 'thread') {

  var quotes = document.getElementsByClassName('quoteLink');
  var mentions = setMentions(quotes);

  for (var i = 0; i < quotes.length; ++i) {
    processQuote(quotes[i]);
  }
  for (var i = 0; i < mentions.length; ++i) {
    processQuote(mentions[i]);
  }


  var MIMETYPES = {
    //a:       'application/octet-stream',
    //ai:      'application/postscript',
    aif:     'audio/x-aiff',
    aifc:    'audio/x-aiff',
    aiff:    'audio/x-aiff',
    au:      'audio/basic',
    avi:     'video/x-msvideo',
    bat:     'text/plain',
    //bin:     'application/octet-stream',
    bmp:     'image/x-ms-bmp',
    c:       'text/plain',
    //cdf:     'application/x-cdf',
    //csh:     'application/x-csh',
    css:     'text/css',
    //dll:     'application/octet-stream',
    //doc:     'application/msword',
    //dot:     'application/msword',
    //dvi:     'application/x-dvi',
    //eml:     'message/rfc822',
    //eps:     'application/postscript',
    //etx:     'text/x-setext',
    //exe:     'application/octet-stream',
    gif:     'image/gif',
    //gtar:    'application/x-gtar',
    h:       'text/plain',
    //hdf:     'application/x-hdf',
    htm:     'text/html',
    html:    'text/html',
    jpe:     'image/jpeg',
    jpeg:    'image/jpeg',
    jpg:     'image/jpeg',
    js:      'application/x-javascript',
    ksh:     'text/plain',
    //latex:   'application/x-latex',
    m1v:     'video/mpeg',
    //man:     'application/x-troff-man',
    //me:      'application/x-troff-me',
    //mht:     'message/rfc822',
    //mhtml:   'message/rfc822',
    //mif:     'application/x-mif',
    mov:     'video/quicktime',
    movie:   'video/x-sgi-movie',
    mp2:     'audio/mpeg',
    mp3:     'audio/mpeg',
    mp4:     'video/mp4',
    mpa:     'video/mpeg',
    mpe:     'video/mpeg',
    mpeg:    'video/mpeg',
    mpg:     'video/mpeg',
    //ms:      'application/x-troff-ms',
    //nc:      'application/x-netcdf',
    //nws:     'message/rfc822',
    //o:       'application/octet-stream',
    //obj:     'application/octet-stream',
    //oda:     'application/oda',
    pbm:     'image/x-portable-bitmap',
    //pdf:     'application/pdf',
    //pfx:     'application/x-pkcs12',
    pgm:     'image/x-portable-graymap',
    png:     'image/png',
    pnm:     'image/x-portable-anymap',
    //pot:     'application/vnd.ms-powerpoint',
    //ppa:     'application/vnd.ms-powerpoint',
    ppm:     'image/x-portable-pixmap',
    //pps:     'application/vnd.ms-powerpoint',
    //ppt:     'application/vnd.ms-powerpoint',
    //pptx:    'application/vnd.ms-powerpoint',
    //ps:      'application/postscript',
    //pwz:     'application/vnd.ms-powerpoint',
    py:      'text/x-python',
    //pyc:     'application/x-python-code',
    //pyo:     'application/x-python-code',
    qt:      'video/quicktime',
    //ra:      'audio/x-pn-realaudio',
    //ram:     'application/x-pn-realaudio',
    ras:     'image/x-cmu-raster',
    //rdf:     'application/xml',
    rgb:     'image/x-rgb',
    //roff:    'application/x-troff',
    rtx:     'text/richtext',
    sgm:     'text/x-sgml',
    sgml:    'text/x-sgml',
    sh:      'application/x-sh',
    //shar:    'application/x-shar',
    //snd:     'audio/basic',
    //so:      'application/octet-stream',
    //src:     'application/x-wais-source',
    //swf:     'application/x-shockwave-flash',
    //t:       'application/x-troff',
    //tar:     'application/x-tar',
    //tcl:     'application/x-tcl',
    //tex:     'application/x-tex',
    //texi:    'application/x-texinfo',
    //texinfo: 'application/x-texinfo',
    tif:     'image/tiff',
    tiff:    'image/tiff',
    //tr:      'application/x-troff',
    tsv:     'text/tab-separated-values',
    txt:     'text/plain',
    //ustar:   'application/x-ustar',
    //vcf:     'text/x-vcard',
    wav:     'audio/x-wav',
    webm:    'video/webm',
    //wiz:     'application/msword',
    //wsdl:    'application/xml',
    xbm:     'image/x-xbitmap',
    //xlb:     'application/vnd.ms-excel',
    //xls:     'application/vnd.ms-excel',
    //xlsx:    'application/vnd.ms-excel',
    xml:     'text/xml',
    //xpdl:    'application/xml',
    xpm:     'image/x-xpixmap',
    //xsl:     'application/xml',
    xwd:     'image/x-xwindowdump',
    zip:     'application/zip'
  };

  var playableTypes = [ 'video/webm', 'audio/mpeg', 'video/mp4' ];
  var videoTypes = [ 'video/webm', 'video/mp4' ];

  var getMime = function getMime(pathName) {
    var pathParts = pathName.split('.');
    var mime;

    if (pathParts.length) {
      var extension = pathParts[pathParts.length - 1];
      mime = MIMETYPES[extension.toLowerCase()] || 'text/plain';

    } else {
      mime = 'text/plain';
    }

    return mime;
  };

  var imageLinkElements = document.getElementsByClassName('imgLink');
  window.attachments = [];
  for (var i = 0; i < imageLinkElements.length; ++i) {
    /* Set image/video inlining */
    attachments[i] = newAttachment(imageLinkElements[i]);
  }

  window.maxFileSize =
    +document.getElementById('labelMaxFileSize').innerHTML;
}
/* =Quotes, =Mentions, =Previews
------------------------------------------------------------*/
function processQuote(quote) {
  var tooltip = document.createElement('div');
  tooltip.style.display = 'none';
  tooltip.setAttribute('class', 'postPreviewTooltip');
  quote.parentNode.appendChild(tooltip);

  var quoteUrl = quote.href;

  var referenceList = quoteReference[quoteUrl] || [];
  referenceList.push(tooltip);
  quoteReference[quoteUrl] = referenceList;

  quote.onmouseenter = function() {
    positionQuotePreview(quote, tooltip);

    if (loadedPreviews.indexOf(quoteUrl) < 0 &&
        loadingPreviews.indexOf(quoteUrl) < 0) {
      setTimeout(function() {
        if (tooltip.innerHTML === "") {
          tooltip.appendChild(createSpinner());
        }
      }, 500); /* Delay before showing spinner (ms) */
      loadQuote(tooltip, quoteUrl);
    }
    showElement(tooltip);

  };

  quote.onmouseout = function() {
    tooltip.style.display = 'none';
  };

  if (!board) {
    var matches = quote.href.match(/\#(\d+)/);

    quote.onclick = function() {
      markPost(matches[1]);
    };
  }

}

function positionQuotePreview(quote, tooltip) {
  //TODO Position tooltip differently depending on available space

  var rightMargin = 6; /* (px) */

  tooltip.style.position = 'absolute';
  tooltip.style.left =
    (quote.offsetLeft + quote.offsetWidth + rightMargin)+'px';
  tooltip.style.top = quote.offsetTop+'px';

  var rightAvailableSpace = document.documentElement.clientWidth -
                         quote.getBoundingClientRect().right - rightMargin;
  tooltip.style.maxWidth = rightAvailableSpace+'px';
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

function setMentions(quotes) {
  var mentions = [];

  for (var i = 0; i < quotes.length; ++i) {
    var mention = setMention(quotes[i]);
    if (mention) { mentions.push(mention); }
  }

  return mentions;
}

function setMention(quote) {
  var href = quote.getAttribute('href');
  var mentionedId = href.slice(href.lastIndexOf('#') + 1);

  var mentioned = document.getElementById(mentionedId);
  /* If mentioned post is hidden, stop here */
  if (!mentioned) { return; }

  var quotingHref = getParentByClassName(quote, 'post')
    .getElementsByClassName('linkSelf')[0].getAttribute('href');
  var quotingId = quotingHref.slice(quotingHref.lastIndexOf('#') + 1);

  var mention = document.createElement('a');
  mention.setAttribute('class', 'mention');
  mention.setAttribute('href', quotingHref);
  mention.innerHTML = '&gt;&gt;'+quotingId; /* eg.: >>123 */

  mentioned.getElementsByClassName('postHeaderInnerAfter')[0]
    .appendChild(mention);
  return mention;
}

/* =Moderation
------------------------------------------------------------*/
function banPosts() {
  var typedReason =
    document.getElementById('reportFieldReason').value.trim();
  var typedExpiration =
    document.getElementById('fieldExpiration').value.trim();
  var typedMessage =
    document.getElementById('fieldbanMessage').value.trim();

  var expiration = Date.parse(typedExpiration || '');

  if (isNaN(expiration)) {
    warning('Invalid expiration');

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

      success('Bans applied');

    } else {
      warning(status + ': ' + JSON.stringify(data));
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

  var typedReason =
    document.getElementById('reportFieldReason').value.trim();

  var toReport = getSelectedContent();

  apiRequest('reportContent', {
    reason : typedReason,
    global : document.getElementById('checkboxGlobal').checked,
    postings : toReport
  }, function requestComplete(status, data) {

    if (status === 'ok') {
      success('Content reported');
    } else {
      warning(status+': '+JSON.stringify(data));
    }
  });
}

function deletePosts() {

  var typedPassword =
    document.getElementById('deletionFieldPassword').value.trim();

  var toDelete = getSelectedContent();

  apiRequest('deleteContent', {
    password : typedPassword,
    postings : toDelete
  }, function requestComplete(status, data) {
    if (status === 'ok') {
      success('Content deleted');
      window.location.pathname = '/';
    } else {
      warning(status+': '+JSON.stringify(data));
    }
  });

}

/* =New post
------------------------------------------------------------*/
/* 'reply': 'true' -> Reply, 'false' -> Thread,
 *  wrapped by sendThreadData(files) and sendReplyData(files) */
function sendPostData(files, reply) {
  var forcedAnon = !document.getElementById('fieldName');

  var typedName = !forcedAnon ?
    document.getElementById('fieldName').value.trim() : undefined;

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value.trim();

  var threadId = reply ?
    document.getElementById('threadIdentifier').value : undefined;

  var typedCaptcha = !hiddenCaptcha ?
    document.getElementById('fieldCaptcha').value.trim() : undefined;

  if (!typedMessage.length) {
    warning('A message is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    warning('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > 2048) {
    warning('Message is too long, keep it under 2048 characters.');
    return;
  } else if (typedEmail.length > 64) {
    warning('Email is too long, keep it under 64 characters.');
    return;
  } else if (typedSubject.length > 128) {
    warning('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    warning('Password is too long, keep it under 8 characters.');
    return;
  } else if (!hiddenCaptcha && typedCaptcha.length !== 6 &&
             typedCaptcha.length !== 24) {
    warning('Captchas are exactly 6 characters long.\n(or 24 in the case of a no-cookie ID)');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    warning('Invalid captcha.');
    return;
  }

  postButton.setAttribute('disabled', '');

  apiRequest(reply ? 'replyThread' : 'newThread', {
    name:     forcedAnon ? null : typedName,
    captcha:  hiddenCaptcha ? null : typedCaptcha,
    password: typedPassword,
    spoiler:  document.getElementById('checkboxSpoiler').checked,
    subject:  typedSubject,
    message:  typedMessage,
    email:    typedEmail,
    files:    files,
    boardUri: boardUri,
    threadId: threadId
  }, reply ? replyCallback : newThreadCallback);

}

function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';

  document.getElementById('captchaImage').src = '/captcha.js#'+
    new Date().toString();
  /* Clear the text field */
  document.getElementById('fieldCaptcha').value = "";
}
