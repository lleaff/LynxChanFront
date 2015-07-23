/* Functions fired up on body.onload, used instead of addEventListener()
 *  for better compatibility. */
var bodyOnLoadStack = [];

/* =DOM Manipulation
============================================================*/
/* Direct
------------------------------*/
function removeElement(domElement) {
  domElement.parentNode.removeChild(domElement);
}

function showElement(domElement) {
  domElement.style.display = '';
}

/* Meta
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

/* /!\ WARNING /!\
* This will override some attributes set using JavaScript
 * like onclick, since they don't appear in .outerHTML. */
function replaceTag(domElement, newTag) {
  var tag = domElement.tagName;
  domElement.outerHTML = domElement.outerHTML.replace(
    new RegExp('<'+tag, 'i'),
    '<'+newTag);
  domElement.outerHTML = domElement.outerHTML.replace(
    new RegExp('</'+tag+'(?!.*'+tag+')', 'i'),
    '</'+newTag);
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
