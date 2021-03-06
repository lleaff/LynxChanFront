if (pageId === 'ruleManagement') {
  var boardIdentifier = document.getElementById('boardIdentifier').value;

  showElement(document.getElementById('addJsButton'));
  removeElement(document.getElementById('addFormButton'));

  var processRuleCell = function(cell) {

    var button = cell.getElementsByClassName('deleteJsButton')[0];
    showElement(button);
    removeElement(cell.getElementsByClassName('deleteFormButton')[0]);

    button.onclick = function() {
      var index = cell.getElementsByClassName('indexIdentifier')[0].value;

      apiRequest('deleteRule', {
        boardUri : boardIdentifier,
        ruleIndex : index,
      }, function requestComplete(status, data) {
        if (status === 'ok') {
          location.reload(true);

        } else {
          notification(status+': '+JSON.stringify(data));
        }
      });
    };
  };

  var rules = document.getElementsByClassName('ruleManagementCell');
  for (var i = 0; i < rules.length; i++) {
    processRuleCell(rules[i]);
  }

  var addRule = function addRule() {
    var typedRule = document.getElementById('fieldRule').value.trim();

    if (!typedRule.length) {
      notification('You can\'t inform a blank rule.');

    } else if (typedRule.length > 512) {
      notification('Rule too long, keep in under 512 characters.');
    } else {

      apiRequest('createRule', {
        boardUri : boardIdentifier,
        rule : typedRule,
      }, function requestComplete(status, data) {
        if (status === 'ok') {
          location.reload(true);
        } else {
          notification(status+': '+JSON.stringify(data));
        }
      });
    }
  };

}
