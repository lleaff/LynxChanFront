/* Functions fired up on body.onload, used instead of addEventListener()
 *  for better compatibility. */
var bodyOnLoadStack = [];

function removeElement(domElement) {
  domElement.parentNode.removeChild(domElement);
}

function showElement(domElement) {
  domElement.style.display = '';
}

function removeClass(domElement, className) {
  domElement.className = domElement.className.replace(
    new RegExp('(?:^|\\s)'+className+'(?!\\S)'), '' );
}

function replaceTag(domElement, newTag) {
  var tag = domElement.tagName;
  domElement.outerHTML = domElement.outerHTML.replace(
    new RegExp('<'+tag, 'i'),
    '<'+newTag);
  domElement.outerHTML = domElement.outerHTML.replace(
    new RegExp('</'+tag+'(?!.*'+tag+')', 'i'),
    '</'+newTag);
}
