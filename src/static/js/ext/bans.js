if (pageId === 'bans') {
  /* Function definitions
  ------------------------------------------------------------*/
  var processBanCell = function(cell) {

    var button = cell.getElementsByClassName('liftJsButton')[0];
    button.style.display = 'inline';

    button.onclick = function() {
      liftBan(cell.getElementsByClassName('idIdentifier')[0].value);
    };

    cell.getElementsByClassName('liftFormButton')[0].style.display = 'none';

  };

  var liftBan = function(ban) {
    apiRequest('liftBan', {
      banId : ban
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        location.reload(true);

      } else {
        notification(status + ': ' + JSON.stringify(data));
      }
    });
  };
  /*------------------------------------------------------------*/

  var bansDiv = document.getElementById('bansDiv');

  for (var j = 0; j < bansDiv.childNodes.length; j++) {
    processBanCell(bansDiv.childNodes[j]);
  }
}
