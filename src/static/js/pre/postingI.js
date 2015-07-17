if (pageId === 'board' || pageId === 'thread') {

  var loadedPreviews = [];
  var loadingPreviews = [];
  var quoteReference = {};

  showElement(document.getElementById('deleteJsButton'));
  showElement(document.getElementById('reportJsButton'));

  if (!board && document.getElementById('inputBan')) {

    showElement(document.getElementById('banJsButton'));
    removeElement(document.getElementById('inputBan'));
  }

  removeElement(document.getElementById('reportFormButton'));
  removeElement(document.getElementById('deleteFormButton'));

  var quotes = document.getElementsByClassName('quoteLink');

  console.log("QUOTES:", quotes);

  quotes.forEach(function(quote) {
    processQuote(quote);
  });

}

