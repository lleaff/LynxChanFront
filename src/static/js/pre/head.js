// @ifdef DEBUG
console.log('head.js - BEGIN PARSING');//DEBUG
// @endif

/* Avoid 'pageId is undefined' */
if (pageId === undefined) { var pageId = null; }

/* =DOM Manipulation
============================================================*/
/* =Direct
------------------------------*/
function removeElement(domElement) {
  // @ifdef DEBUG
  try { //DEBUG
  // @endif
    domElement.parentNode.removeChild(domElement);
  // @ifdef DEBUG
  } catch(e) { //DEBUG
    console.log(e); //DEBUG
    throw(e); //DEBUG
  } //DEBUG
  // @endif
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


/* =Elements
------------------------------*/
/* Cute spinning loading icon */
function createSpinner() {
  var spinner = document.createElement('span');
  spinner.setAttribute('class', 'fa fa-spinner fa-pulse');
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
