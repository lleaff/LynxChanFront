if (pageId === 'board' || pageId === 'thread') {

  var loadedPreviews = [];
  var loadingPreviews = [];
  var quoteReference = {};

  document.getElementById('deleteJsButton').style.display = 'inline';
  document.getElementById('reportJsButton').style.display = 'inline';

  if (!board && document.getElementById('inputBan')) {

    document.getElementById('banJsButton').style.display = 'inline';

    document.getElementById('inputBan').style.display = 'none';
  }

  document.getElementById('reportFormButton').style.display = 'none';
  document.getElementById('deleteFormButton').style.display = 'none';

  var quotes = document.getElementsByClassName('quoteLink');

  for (var i = 0; i < quotes.length; i++) {
    var quote = quotes[i];

    processQuote(quote);
  }

}

