/* Functions fired up on body.onload, used instead of addEventListener()
 *  for better compatibility. */
var bodyOnLoadStack = [];

function removeElement(domElement) {
  domElement.parentNode.removeChild(domElement);
}

function showElement(domElement) {
  domElement.style.display = '';
}
