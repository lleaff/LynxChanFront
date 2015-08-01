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
