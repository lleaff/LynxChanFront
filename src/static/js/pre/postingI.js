if (pageId === 'board' || pageId === 'thread') {
  /* Objects containing information about post user images */
  window.imageList = [];

  bodyOnLoadStack.push(function() {
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

    var quotes = document.getElementsByClassName('quoteLink');

    for (var i = 0; i < quotes.length; ++i) {
      processQuote(quotes[i]);
    }

  });
}

