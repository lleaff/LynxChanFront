function handleConnectionResponse(xhr, delegate) {
  var response;

  try {
    response = JSON.parse(xhr.responseText);

    if (VERBOSE) {
      console.log(xhr.responseText);
    }
  } catch (error) {
    alert('Error in parsing response.');
    return;
  }

  if (response.auth && response.auth.authStatus === 'expired') {
    document.cookie = 'hash=' + response.auth.newHash;

  }

  if (response.status === 'error') {
    alert('Internal server error. '+response.data);
  } else if (response.status === 'fileTooLarge') {
    alert('File size exceeded maximum allowed'+
          maxFileSize ? ' ('+maxFileSize+' MB).' : '.');
  } else if (response.status === 'blank') {
    alert('Parameter '+response.data+' was sent in blank.');
  } else if (response.status === 'tooLarge') {
    alert('Request refused because it was too large');
  } else if (response.status === 'construction') {
    alert('This page is under construction.');
  } else if (response.status === 'denied') {
    alert('You are not allowed to perform this operation.');
  } else if (response.status === 'maintenance') {
    alert('This site is undergoing maintenance, all of its functionality has been temporarily disabled.');
  } else if (response.status === 'banned') {
    if (response.data.range) {
      alert('Your ip range '+response.data.range+' has been banned from '+
            response.data.board + '.');
    } else {
      alert('You are banned from '+response.data.board+' until '+
            new Date(response.data.expiration).toString()+'.\nReason: '+
            response.data.reason+'.\nYour ban id: '+response.data.banId);
    }
  } else {
    delegate(response.status, response.data);
  }

}

// Makes a request to the back-end.
// page: url of the api page
// parameters: parameter block of the request
// delegate: callback that will receive (data,status). If the delegate has a
// function in stop property, it will be called when the connection stops
// loading.
function apiRequest(page, parameters, delegate) {
  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('POST', API_DOMAIN + page, true);
    //xhr.withCredentials = true;
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('POST', API_DOMAIN + page);
  } else {
    alert('This site can\'t run JS on your browser because it does not support CORS requests. Disable JavaScript and try again.');

    return;
  }

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState == 4) {

      if (delegate.hasOwnProperty('stop')) {
        delegate.stop();
      }

      if (xhr.status != 200) {
        alert('Connection failed.');
        return;
      }

      handleConnectionResponse(xhr, delegate);
    }
  };

  var parsedCookies = {};

  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {

    var cookie = cookies[i];

    var parts = cookie.split('=');
    parsedCookies[parts.shift().trim()] = decodeURI(parts.join('='));

  }

  var body = {
    captchaId : parsedCookies.captchaid,
    parameters : parameters,
    auth : {
      login : parsedCookies.login,
      hash : parsedCookies.hash
    }
  };

  if (VERBOSE) {
    console.log(JSON.stringify(body));
  }

  xhr.send(JSON.stringify(body));

}

function localRequest(address, callback) {

  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('GET', address, true);
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('GET', address);
  } else {
    alert('This site can\'t run js on your shitty browser because it does not support CORS requests. Disable js and try again.');
    return;
  }

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState == 4) {

      if (callback.hasOwnProperty('stop')) {
        callback.stop();
      }

      if (xhr.status != 200) {
        callback('Connection failed');
      } else {
        callback(null, xhr.responseText);
      }

    }
  };

  xhr.send();
}

var settingsRelation = {
  checkboxAlwaysSign : 'alwaysSignRole'
};

function logout() {

  document.cookie = 'login=invalid+login';
  document.cookie = 'hash=invalid+hash';

  window.location.pathname = '/login.html';

}

function changePassword() {

  var typedPassword = document.getElementById('fieldPassword').value;
  var typedNewPassword = document.getElementById('fieldNewPassword').value;
  var typedConfirmation = document.getElementById('fieldConfirmation').value;

  if (!typedPassword.length) {
    alert('You must provide your current password.');
  } else if (typedConfirmation !== typedNewPassword) {
    alert('Password confirmation does no match');
  } else if (!typedNewPassword.length) {
    alert('You cannot provide a blank password.');
  } else {
    apiRequest('changeAccountPassword', {
      password : typedPassword,
      newPassword : typedNewPassword,
      confirmation : typedConfirmation
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Password changed.');

        location.reload(true);

      } else {
        alert(status+': '+JSON.stringify(data));
      }
    });
  }

}

function save() {
  var selectedSettings = [];

  for (var key in settingsRelation) {
    if (document.getElementById(key).checked) {
      selectedSettings.push(settingsRelation[key]);
    }
  }

  var emailField = document.getElementById('emailField');

  var typedEmail = emailField.value.trim();

  if (emailField.validity && emailField.validity.valid === false) {
    alert('Please enter a valid email address');
  } else if (typedEmail.length > 64) {
    alert('Email too long, keep it under 64 characters');
  } else {
    apiRequest('changeAccountSettings', {
      email : typedEmail,
      settings : selectedSettings
    }, function requestComplete(status, data) {
      if (status === 'ok') {
        alert('Settings changed.');
      } else {
        alert(status+': '+JSON.stringify(data));
      }
    });

  }

}

function createBoard() {

  var typedUri = document.getElementById('newBoardFieldUri').value.trim();
  var typedName = document.getElementById('newBoardFieldName').value.trim();
  var typedDescription = document.getElementById('newBoardFieldDescription').value
      .trim();

  if (!typedUri.length || !typedName.length || !typedDescription.length) {
    alert('All fields are mandatory.');
  } else if (/\W/.test(typedUri)) {
    alert('Invalid uri.');
    return;
  } else {
    apiRequest('createBoard', {
      boardUri : typedUri,
      boardName : typedName,
      boardDescription : typedDescription
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Board created.');

        window.location.pathname = '/'+typedUri+'/';

      } else {
        alert(status+': '+JSON.stringify(data));
      }
    });
  }

}

function reloadCaptcha() {
  document.cookie = 'captchaid=; path=/;';

  document.getElementById('captchaImage').src = '/captcha.js#'+
    new Date().toString();
  /* Clear the text field */
  document.getElementById('fieldCaptcha').value = "";
}

var postCallback = function requestComplete(status, data) {

  if (status === 'ok') {

    alert('Thread created.');

    window.location.pathname = '/' + boardUri + '/res/' + data + '.html';

  } else {
    alert(status + ': ' + JSON.stringify(data));
  }
};

postCallback.stop = function() {
  postButton.removeAttribute('disabled');
};

function sendThreadData(files) {

  var forcedAnon = !document.getElementById('fieldName');

  var typedName = !forcedAnon ?
    document.getElementById('fieldName').value.trim() : undefined;

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value.trim();

  var hiddenCaptcha = !document.getElementById('captchaDiv');

  var typedCaptcha = !hiddenCaptcha ?
    document.getElementById('fieldCaptcha').value.trim() : undefined;

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

  postButton.setAttribute('disabled', '');

  apiRequest('newThread', {
    name : forcedAnon ? null : typedName,
    captcha : hiddenCaptcha ? null : typedCaptcha,
    password : typedPassword,
    spoiler : document.getElementById('checkboxSpoiler').checked,
    subject : typedSubject,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : boardUri
  }, postCallback);

}

function postThread() {
  iterateSelectedFiles(0, [],
                       document.getElementById('files'), sendThreadData);
}


function recoverAccount() {

  var typedLogin = document.getElementById('recoverFieldLogin').value.trim();

  if (typedLogin.length) {

    apiRequest('requestAccountRecovery', {
      login : typedLogin
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Password request created. Check your e-mail.');

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

}

function loginUser() {

  var typedLogin = document.getElementById('loginFieldLogin').value.trim();
  var typedPassword = document.getElementById('loginFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else {
    apiRequest('login', {
      login : typedLogin,
      password : typedPassword
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        document.cookie = 'login=' + typedLogin;
        document.cookie = 'hash=' + data;

        window.location.pathname = '/account.js';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }
}

function registerAccount() {

  var typedLogin = document.getElementById('registerFieldLogin').value.trim();
  var typedEmail = document.getElementById('registerFieldEmail').value.trim();
  var typedPassword = document.getElementById('registerFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else if (typedLogin.length > 16) {
    alert('Login too long, keep it under 16 characters');
  } else if (typedEmail.length > 64) {
    alert('Email too long, keep it under 64 characters');
  } else if (/\W/.test(typedLogin)) {
    alert('Invalid login.');
  } else {

    apiRequest('registerAccount', {
      login : typedLogin,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        document.cookie = 'login=' + typedLogin;
        document.cookie = 'hash=' + data;

        window.location.pathname = '/account.js';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

}

console.log('posting.js - BEGIN PARSING');//DEBUG
function iterateSelectedFiles(currentIndex, files, fileChooser, callback) {
  window.callback = callback;
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
    window.callback(files);
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
  var imageLinks = [];
  for (var i = 0; i < imageLinkElements.length; ++i) {
    imageLinks[i] = imageLinkElements[i];
    processImageLink(imageLinks[i], i);
  }

  window.maxFileSize =
    +document.getElementById('labelMaxFileSize').innerHTML;
}

/* =Uploads, =Images, =Videos
------------------------------------------------------------*/
function processImageLink(link, i) {
  var mime = getMime(link.href);

  if (mime.indexOf('image/') > -1) {
    var obj = {};
    obj.thumb          = link.getElementsByTagName('img')[0];
    obj.thumbSrc       = obj.thumb.getAttribute('src');
    obj.link           = link;
    obj.container      = link.parentNode; /* .uploadCell */
    obj.maxThumbWidth  = obj.container.style.maxWidth;
    obj.maxThumbHeight = obj.container.style.maxHeight;
    setClickableImage(obj);

  } else if (playableTypes.indexOf(mime) > -1) {
    setPlayer(link, mime);
  }
}
function setClickableImage(obj) {
  obj.link.onclick = function(event) {
    return initialImageExpand(event, obj);
  };
}

/* mouseEvent.target -> link */
function initialImageExpand(event, obj) {
  /* return: false -> Don't follow link, true -> Follow link */

  /* If event was fired by middle mouse button or combined with
   * the ctrl key, act as a normal link */
  if (event.which === 2 || event.ctrlKey) {
    return true;
  }

  obj.thumb.style.opacity = 0.9; /* Immediate feedback, then transition */
  clickAnim(obj.thumb, {
            manualUnset: true,
            duration: 400,
            opacity: 0.5
  });

  obj.expandedSrc = obj.link.href;

  if (obj.expandedSrc === obj.thumbSrc) {
    obj.thumb.className += ' imgExpanded';
  } else {
    obj.expanded = document.createElement('img');
    obj.expanded.setAttribute('src', obj.expandedSrc);
    obj.expanded.setAttribute('style', 'display: none;');
    obj.expanded.setAttribute('class', 'imgExpanded');
    obj.link.appendChild(obj.expanded);

    obj.expanded.onload = function(e) {
      obj.thumb.style.display = 'none';
      obj.expanded.style.display = '';
      obj.container.style.maxWidth  = '';
      obj.container.style.maxHeight = '';
      clickAnim(obj.thumb, { unset: true });
    };
  }
  obj.link.onclick = function(event) {
    return toggleImage(event, obj);
  };
  return false;
}

function toggleImage(event, obj) {
  /* If event was fired by middle mouse button or combined with
   * the ctrl key, act as a normal link */
  if (event.which === 2 || event.ctrlKey) {
    return true;
  }
  var el = obj.thumb;
  if (obj.expandedSrc === obj.thumbSrc) {
    if (obj.thumb.className.indexOf('imgExpanded') != -1) {
      removeClass(obj.thumb, 'imgExpanded');
    } else {
      obj.thumb.className += 'imgExpanded';
    }
  } else if (obj.expanded.style.display === 'none') {
    obj.thumb.style.display = 'none';
    obj.container.style.maxHeight = '';
    obj.container.style.maxWidth  = '';
    obj.expanded.style.display = '';
  } else {
    obj.expanded.style.display = 'none';
    obj.container.style.maxHeight = el.maxThumbHeight;
    obj.container.style.maxWidth = el.maxThumbWidth;
    obj.thumb.style.display = '';
  }
  return false;
}

function setPlayer(link, mime, uploadCell, maxWidth, maxHeight) {
  var path = link.href;
  var parent = link.parentNode;

  var src = document.createElement('source');
  src.setAttribute('src', link.href);
  src.setAttribute('type', mime);

  var video = document.createElement(videoTypes.indexOf(mime) > -1 ? 'video' : 'audio');
  video.setAttribute('controls', true);
  video.style.display = 'none';
  video.appendChild(src);

  var videoContainer = document.createElement('span');
  videoContainer.setAttribute('class', 'videoContainer');

  var hideLink = document.createElement('a');
  hideLink.innerHTML = '[ - ]';
  hideLink.style.display = 'none';
  hideLink.setAttribute('class', 'hideLink');
  hideLink.onclick = function() {
    newThumb.style.display = '';
    video.style.display = 'none';
    hideLink.style.display = 'none';
    video.pause();
  };

  var newThumb = document.createElement('img');
  newThumb.setAttribute('src', link.childNodes[0].src);
  newThumb.onclick = function() {
    newThumb.style.display = 'none';
    video.style.display = '';
    uploadCell.style.maxWidth  = maxWidth;
    uploadCell.style.maxHeight = maxHeight;
    hideLink.style.display = '';
    video.play();
  };

  videoContainer.appendChild(hideLink);
  videoContainer.appendChild(video);
  uploadCell.style.maxWidth  = '';
  uploadCell.style.maxHeight = '';
  videoContainer.appendChild(newThumb);

  parent.replaceChild(videoContainer, link);
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

  var quote, href, quotingHref, quotingId, mentionedId, mention, mentioned;
  for (var i = 0; i < quotes.length; ++i) {
    quote = quotes[i];

    href = quote.getAttribute('href');
    mentionedId = href.slice(href.lastIndexOf('#') + 1);

    /* If mentioned post is hidden, stop here */
    if (!(mentioned = document.getElementById(mentionedId))) {
      continue;
    }
    
    quotingHref = getParentByClassName(quote, 'post')
      .getElementsByClassName('linkSelf')[0].getAttribute('href');
    quotingId = quotingHref.slice(quotingHref.lastIndexOf('#') + 1);

    mention = document.createElement('a');
    mention.setAttribute('class', 'mention');
    mention.setAttribute('href', quotingHref);
    mention.innerHTML = '&gt;&gt;'+quotingId; /* eg.: >>123 */

    mentions.push(mention);
    mentioned.getElementsByClassName('postHeaderInnerAfter')[0]
      .appendChild(mention);
  }

  return mentions;
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

  var typedReason =
    document.getElementById('reportFieldReason').value.trim();

  var toReport = getSelectedContent();

  apiRequest('reportContent', {
    reason : typedReason,
    global : document.getElementById('checkboxGlobal').checked,
    postings : toReport
  }, function requestComplete(status, data) {

    if (status === 'ok') {
      alert('Content reported');
    } else {
      alert(status+': '+JSON.stringify(data));
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
      alert('Content deleted');
      window.location.pathname = '/';
    } else {
      alert(status+': '+JSON.stringify(data));
    }
  });

}

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
