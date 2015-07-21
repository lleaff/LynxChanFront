if (pageId === 'bannerManagement') {

  /* Function definitions
  ------------------------------------------------------------*/
  var processBannerCell = function(cell) {

    var button = cell.getElementsByClassName('deleteJsButton')[0];
    showElement(button);

    button.onclick = function() {
      removeBanner(cell.getElementsByClassName('bannerIdentifier')[0].value);
    };

    removeElement(cell.getElementsByClassName('deleteFormButton')[0]);

  };

  var addBanner = function() {

    var file = document.getElementById('files').files[0];

    if (!file) {
      alert('You must select a file');
      return;
    }

    var reader = new FileReader();

    reader.onloadend = function(e) {

      var files = [ {
        name : file.name,
        content : reader.result
      } ];

      // style exception, too simple

      apiRequest('createBanner', {
        files : files,
        boardUri : boardIdentifier,
      }, function requestComplete(status, data) {

        if (status === 'ok') {

          location.reload(true);

        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

      // style exception, too simple

    };

    reader.readAsDataURL(file);

  };

  var removeBanner = function(bannerId) {
    apiRequest('deleteBanner', {
      bannerId : bannerId,
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        location.reload(true);

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  };
  /*------------------------------------------------------------*/

  var boardIdentifier = document.getElementById('boardIdentifier').value;

  showElement(document.getElementById('addJsButton'));
  removeElement(document.getElementById('addFormButton'));

  var bannersDiv = document.getElementById('bannersDiv');
  for (var j = 0; j < bannersDiv.childNodes.length; j++) {
    processBannerCell(bannersDiv.childNodes[j]);
  }

}
