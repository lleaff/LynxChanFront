// @ifdef DEBUG
console.log('head.js - BEGIN PARSING');//DEBUG
// @endif

/* Avoid 'pageId is undefined' */
if (pageId === undefined) { var pageId = null; }



/* =Objects
============================================================*/
/* Returns a new class that extends another class, 'newConstructor' will be
 *  called after the extended class constructor's on each new object. New
 *  arguments to the constructor must be appended to the original
 *  constructor's arguments, ie. 'newConstructor' must take the same
 *  arguments as extended. . */
function extend(extended, newConstructor) {
  var newClass = function() {
    extended.apply(this, arguments);

    newConstructor.apply(this, arguments);
  };
  newClass.prototype = Object.create(extended.prototype);
  newClass.prototype.constructor = newClass;
  return newClass;
}


/* =DOM Manipulation
============================================================*/
/* =Direct
------------------------------*/
function removeElement(domElement) {
  try {
    if (domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
      return true;
    }
  } catch(e) {
    if (e.code === 8) { /* NotFoundError */
      // @ifdef DEBUG
      console.log('removeElement(): Node not found: ', domElement,
                  '(caller: ', removeElement.caller, ')');
      // @endif
    } else {
      throw(e);
    }
  }
  return false;
}

function showElement(domElement) {
  // @ifdef DEBUG
  try { //DEBUG
  // @endif
    domElement.style.display = '';
  // @ifdef DEBUG
  } catch(e) { //DEBUG
    console.log(e); //DEBUG
    throw(e); //DEBUG
  } //DEBUG
  // @endif
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

/* @exclude */
/* Supports multiple classNames */
//function getParentByClassNames(domElement, classNames) {
//  if (typeof(classNames) === 'string') { classNames = [classNames]; }
//  for (var i; (domElement = domElement.parentNode); ) {
//    for (i = 0; i < classNames.length; ++i) {
//      if (hasClass(domElement, classNames[i])) {
//        break;
//      }
//    }
//  }
//  return domElement;
//}
/* @endexclude */

/* =Elements
------------------------------*/
/* Cute spinning icon to indicate loading */
function createSpinner() {
  var spinner = document.createElement('span');
  spinner.setAttribute('class', 'fa fa-spinner fa-pulse loadingPreview');
  return spinner;
}

/* FontAwesome dependency */
function createCloseButton(targetElement, callback) {
  var button = document.createElement('button');
  button.setAttribute('class', 'closeButton fa fa-close');
  button.onclick = function() {
    if (targetElement) { removeElement(targetElement); }
    if (callback) { callback(); }
  };
  return button;
}

/* options: 
 *  - escape (true): Escape characters in message for display as text, set
 *      to false to inject raw html instead.
 *  - timeout (2300): Time in milliseconds to show the notification, set to
 *      false to let the user close it xemselves.
 *  - tone (neutral, positive, negative): Add class to the element to
 *      visually communicate the tone of the message (success/error).
 *  - closeButton (true): Allow the user to close the notification with
 *      a cross button. */
function notification(message, options) {
  if (options === undefined) { options = {}; }

  var el = document.createElement('div');
  var inner = document.createElement('div');
  inner.setAttribute('class', 'notificationInner');
  el.appendChild(inner);

  if (options.escape === undefined || options.escape === true) {
    inner.appendChild(document.createTextNode(message));
  } else {
    inner.innerHTML = message;
  }

  el.setAttribute('class', 'notification '+(options.tone || 'neutral'));
  /* Override pointer-events:none; on container. */
  el.setAttribute('style', 'pointer-events:auto;');

  var timeoutId;
  if (options.timeout !== false) {
    timeoutId = setTimeout(
      function() { removeElement(el); },
      options.timeout === undefined ? 2300 : options.timeout);
  }
  if (options.closeButton === undefined || options.closeButton === true) {
    el.insertBefore(
      createCloseButton(
        el,
        timeoutId ?  function() { clearTimeout(timeoutId); } : undefined),
      inner);
  }

  /* Center 'display: inline-block' */
  var container = document.getElementById('notificationsContainer');
  if (!container) {
    container = document.createElement('div');
    container.setAttribute('id', 'notificationsContainer');
    container.setAttribute('style',
      'position:fixed;top:0;width:100%;text-align:center;pointer-events:none;');
    document.body.appendChild(container);
  }
  container.appendChild(el);
  return el;
}

/* Wrappers over notification() */
function warning(message, options) {
  if (options === undefined) { options = {}; }
  options.tone = 'negative';
  notification(message, options);
}
function success(message, options) {
  if (options === undefined) { options = {}; }
  options.tone = 'positive';
  notification(message, options);
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
