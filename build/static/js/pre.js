var API_DOMAIN = 'http://api.localhost:8080/';
var VERBOSE = true;
var DISABLE_JS = false;

console.log('head.js - BEGIN PARSING');//DEBUG
/* Avoid 'pageId is undefined' */
if (pageId === undefined) { var pageId = null; }

/* =DOM Manipulation
============================================================*/
/* =Direct
------------------------------*/
function removeElement(domElement) {
  try { //DEBUG
    domElement.parentNode.removeChild(domElement);
  } catch(e) { //DEBUG
    console.log(e); //DEBUG
    throw(e); //DEBUG
  } //DEBUG
}

function showElement(domElement) {
  try { //DEBUG
    domElement.style.display = '';
  } catch(e) { //DEBUG
    console.log(e); //DEBUG
    throw(e); //DEBUG
  } //DEBUG
}

/* =Meta
------------------------------*/
/* Remove 'value' from 'domElement''s 'attribute' */
function removeCompoundAttribute(domElement, attribute, value) {
  var attr = domElement.getAttribute(attribute);
  if (!attr) { return false; }

  domElement.setAttribute(attribute,
      attr.replace(
        new RegExp('(?:^|\\s)'+value+'(?!\\S)(?!.*'+value+')'), ''));
}
/* Specialized version of removeCompoundAttribute() */
function removeClass(domElement, className) {
  var classes = domElement.className;
  if (!classes) { return false; }

  domElement.className = classes.replace(
    new RegExp('(?:^|\\s)'+className+'(?!\\S)'), '' );
}

function hasClass(domElement, className) {
  return domElement.className.split(' ').indexOf(className) > -1;
}

function addClass(domElement, className) {
  if (!hasClass(domElement, className)) {
    domElement.className += ' '+className;
  }
}

/* /!\ WARNING /!\
* This will override some attributes set using JavaScript
 * like onclick, since they don't appear in .outerHTML. */
//function replaceTag(domElement, newTag) {
//  var tag = domElement.tagName;
//  domElement.outerHTML = domElement.outerHTML.replace(
//    new RegExp('<'+tag, 'i'),
//    '<'+newTag);
//  domElement.outerHTML = domElement.outerHTML.replace(
//    new RegExp('</'+tag+'(?!.*'+tag+')', 'i'),
//    '</'+newTag);
//}

/* =Get
------------------------------*/
function getParentByClassName(domElement, className) {
  while ((domElement = domElement.parentNode) &&
         !hasClass(domElement, className)) {}
  return domElement;
}

/* =Elements
------------------------------*/
/* Cute spinning loading icon */
function createSpinner() {
  var spinner = document.createElement('span');
  spinner.setAttribute('class', 'fa fa-spinner fa-pulse loadingPreview');
  return spinner;
}

/* =Feedback
============================================================*/
 /* options {
 *    duration: transition duration.
 *    timeout:  how long to stay in highest animation state.
 *    manualUnset: if true, don't reverse animation.
 *    unset:    don't animate but reverse previously applied animation.
 *  } */
function clickAnim(element, options) {
  var duration = options.duration === undefined ? 100 : options.duration;
  var seconds = (Math.round(duration / 10) / 100)+'s'; 
  var opacity = options.opacity === undefined ? 0.8 : options.opacity;

  if (!options.unset) {
    element.style.transitionProperty += ' opacity';
    element.style.opacity = opacity;
    /* 2 decimal places precision */
    element.style.transitionDuration += seconds;
  }
  if (!options.manualUnset || options.unset) {
    var timeout = options.unset ? 0 :
      options.timeout === undefined ? options.duration : options.timeout;

    setTimeout(function() {
      element.style.opacity = '';
      removeCompoundAttribute(element, 'transition-property', 'opacity');
      removeCompoundAttribute(element, 'transition-duration', seconds);
    }, timeout);
  }
}

/* =User input
============================================================*/
/* Global onkeydown handler */
window.onkeydown = function keydownHandler(e) {
  var keyCode = e.keyCode;
  var target = e.target;
  var tagName = e.target.tagName;

  switch(keyCode) {
    case 13: /* Enter */
    if (tagName === 'INPUT' || (tagName === 'TEXTAREA' && e.ctrlKey)) {
      formEnterKeyHandler(target);
    }
    break;
  }
};

/* Activate forms .submit buttons with Enter and Ctrl-Enter in textareas */
function formEnterKeyHandler(focusedElem) {
  if (focusedElem.form) {
    focusedElem.form.getElementsByClassName('submit')[0].click();
  }
}

if (pageId === 'board') {
  window.board = true;
  window.boardUri = document.getElementById('boardIdentifier').value;

  window.postButton = document.getElementById('jsButton');
  showElement(postButton);

  if (document.getElementById('captchaDiv')) {
    showElement(document.getElementById('reloadCaptchaButton'));
  }

  removeElement(document.getElementById('formButton'));

}


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


  window.boardUri           = undefined;
  window.threadId           = undefined;
  window.board              = false;
  window.replyButton        = undefined;
  window.refreshButton      = undefined;
  window.lastReplyId        = 0;
  window.lastRefreshWaiting = 0;
  window.refreshLabel       = undefined;
  window.autoRefresh        = undefined;
  window.refreshTimer       = undefined;
  window.lastRefresh        = undefined;
  window.currentRefresh     = undefined;
  window.manualRefresh      = undefined;
  window.foundPosts         = undefined;
  window.hiddenCaptcha      = !document.getElementById('captchaDiv');
  window.markedPosting      = undefined;

  /* @excude */
  /* Replaced with actual .html file content using gulp-preprocess */
  /* @endexclude */
  window.postCellTemplate = '<article class="post postReply">\n  <header class="postHeader postReplyHeader">\n    <div class="postHeaderInner">\n      <ul>\n        <li class="deletionCheckBoxWrap">\n          <input type="checkbox" class="deletionCheckBox"/>\n        </li>\n        <li class="linkPreviewWrap"><a title="Singled-out post" class="linkPreview fa fa-link"></a></li>\n        <li class="labelSubject"></li>\n        <li><a class="linkName"></a></li>\n        <li class="labelRole"></li>\n        <li class="spanId">ID:<span class="labelId"></span></li>\n        <li class="labelCreated"></li>\n        <li><a class="linkSelf">No.</a><a class="linkQuote"></a></li>\n        \n      </ul>\n    </div>\n    <div class="postHeaderInnerAfter"></div>\n  </header>\n  <section class="postContent">\n    <div class="panelUploads"></div>\n    <div class="messageWrap">\n      <div class="textBumper"> </div><br class="textBumperReturn"/>\n      <p class="divMessage"></p>\n    </div>\n  </section>\n  <div class="divBanMessage"></div>\n  <div class="labelLastEdit"></div>\n</article>';
  window.uploadCellTemplate = '<figcaption class="fileInfo"><small class="fileInfoInner"><a class="originalNameLink"></a><a class="nameLink"></a><span class="sizeLabel"></span><span class="dimensionLabel"></span></small>\n  \n</figcaption><a class="imgLink"></a>';

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

if (pageId === 'board' || pageId === 'thread') {

  window.loadedPreviews = [];
  window.loadingPreviews = [];
  window.quoteReference = {};

  showElement(document.getElementById('deleteJsButton'));
  showElement(document.getElementById('reportJsButton'));

  if (!board && document.getElementById('inputBan')) {
    showElement(document.getElementById('banJsButton'));
    removeElement(document.getElementById('inputBan'));
  }

  removeElement(document.getElementById('reportFormButton'));
  removeElement(document.getElementById('deleteFormButton'));

}

if (pageId === 'account') {

  showElement(document.getElementById('logoutJsButton'));
  removeElement(document.getElementById('logoutFormButton'));

  showElement(document.getElementById('saveJsButton'));
  removeElement(document.getElementById('saveFormButton'));

  showElement(document.getElementById('passwordJsButton'));
  removeElement(document.getElementById('passwordFormButton'));

  showElement(document.getElementById('newBoardJsButton'));
  removeElement(document.getElementById('newBoardFormButton'));

}

if (pageId === 'catalog') {

  /* =Functions
     ============================================================*/
  var expandCatalogOp = function(e) {
    /* If click is on image link, just follow it */
    if (e.target.parentNode.className.indexOf('linkThumb') > -1 ||
        e.target.className.indexOf('linkThumb') > -1) {
      return true;
    }

    var content = e.currentTarget
    .getElementsByClassName('catalogCellContent')[0];
    if (content.style.overflowY === 'auto') {
      content.style.overflowY = '';
    } else {
      content.style.overflowY = 'auto';
    }
  };

  var catalogCellLinkHover = function(e) {
    /* Get caller's containing cell */
    /* assume: <a>=>.catalogThread=>.catalogCell */
    var cell = e.currentTarget.parentNode.parentNode;
    /* if false, then event caller is .catalogThreadDetails */
    if (!hasClass(cell, 'catalogCell')) {
      /* .linkThumb=>.catalogCellHeader=>.catalogCellContent=>
       *  .catalogThread=>.catalogCell */
      cell = cell.parentNode.parentNode;
    }
    /*------------------------------*/

    var type = e.type;
    if (type === 'mouseenter') {
      addClass(cell, 'catalogCellLinkHover');
    } else if (type === 'mouseleave') {
      removeClass(cell, 'catalogCellLinkHover');
    }
  };

  /* =Initialization
     ============================================================*/
  /* Hide details if empty */
  var labelsReplies = document.getElementsByClassName('labelReplies');
  for (var i = 0; i < labelsReplies.length; ++i) {
    if (labelsReplies[i].innerHTML === '0') {
      labelsReplies[i].style.display = 'none';
    }
  }
  var labelsImages = document.getElementsByClassName('labelImages');
  for (var i = 0; i < labelsImages.length; ++i) {
    if (labelsImages[i].innerHTML === '0') {
      labelsImages[i].style.display = 'none';
    }
  }

  /* Set details area as link to thread#bottom */
  var catalogThreads =
    document.getElementsByClassName('catalogThread');
  for (var i = 0, thread, threadUrl, details;
       i < catalogThreads.length;
       ++i) {
    thread = catalogThreads[i];
    threadUrl = thread.getElementsByClassName('linkThumb')[0]
      .getAttribute('href');
    details = thread.getElementsByClassName('catalogThreadDetails')[0];
    
    var link = document.createElement('a');
    link.setAttribute('href', threadUrl+'#bottom');
    thread.appendChild(link);
    link.appendChild(details);

    link.onmouseenter = catalogCellLinkHover;
    link.onmouseleave = catalogCellLinkHover;
  }

}

if (pageId === 'login') {
  showElement(document.getElementById('registerJsButton'));
  showElement(document.getElementById('loginJsButton'));
  showElement(document.getElementById('recoverJsButton'));

  removeElement(document.getElementById('recoverFormButton'));
  removeElement(document.getElementById('registerFormButton'));
  removeElement(document.getElementById('loginFormButton'));
}

