if (pageId === 'board' || pageId === 'thread') {
  /* Objects containing information about post user images */

  /* ---TEMPORARY begin---TODO*/
  /* Replace .uploadCell <div>'s with <figure>'s */
  //var uploadCells = document.body.getElementsByClassName('uploadCell');
  //for (var i = 0; i < uploadCells.length; ++i) {
  //  replaceTag(uploadCells[i], 'figure');
  //}
  /* ---TEMPORARY end---*/

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

