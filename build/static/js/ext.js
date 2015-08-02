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
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  };
  /*------------------------------------------------------------*/

  var bansDiv = document.getElementById('bansDiv');

  for (var j = 0; j < bansDiv.childNodes.length; j++) {
    processBanCell(bansDiv.childNodes[j]);
  }
}

if (pageId === 'boardManagement') {

  /* =Function definitions
  ------------------------------------------------------------*/
  var saveSettings = function() {
    var typedName = document.getElementById('boardNameField').value.trim();
    var typedDescription = document.getElementById('boardDescriptionField').value
    .trim();
    var typedAnonymousName = document.getElementById('anonymousNameField').value
    .trim();

    if (!typedName.length || !typedName.length) {
      alert('Both name and description are mandatory.');
      return;
    }

    var settings = [];

    if (document.getElementById('disableIdsCheckbox').checked) {
      settings.push('disableIds');
    }
    if (document.getElementById('allowCodeCheckbox').checked) {
      settings.push('allowCode');
    }
    if (document.getElementById('disableCaptchaCheckbox').checked) {
      settings.push('disableCaptcha');
    }
    if (document.getElementById('forceAnonymityCheckbox').checked) {
      settings.push('forceAnonymity');
    }

    apiRequest('setBoardSettings', {
      boardName : typedName,
      anonymousName : typedAnonymousName,
      boardDescription : typedDescription,
      boardUri : boardIdentifier,
      settings : settings
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        location.reload(true);

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

  var processVolunteerCell = function(cell) {
    var button = cell.getElementsByClassName('removeJsButton')[0];
    button.style.display = 'inline';
    cell.getElementsByClassName('removeFormButton')[0].style.display = 'none';

    button.onclick = function() {
      setVolunteer(cell.getElementsByClassName('userIdentifier')[0].value, false);
    };

  }

  var addVolunteer = function() {
    setVolunteer(document.getElementById('addVolunteerFieldLogin').value.trim(),
                 true);
  }

  var setVolunteer = function(user, add) {

    apiRequest('setVolunteer', {
      login : user,
      add : add,
      boardUri : boardIdentifier
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        location.reload(true);

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

  var transferBoard = function() {

    apiRequest('transferBoardOwnership', {
      login : document.getElementById('transferBoardFieldLogin').value.trim(),
      boardUri : boardIdentifier
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        window.location.pathname = '/' + boardIdentifier + '/';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

  var deleteBoard = function() {
    apiRequest('deleteBoard', {
      boardUri : boardIdentifier
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        window.location.pathname = '/';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  };

  var makeCssRequest = function(files) {
    apiRequest('setCustomCss', {
      files : files || [],
      boardUri : boardIdentifier,
    }, function requestComplete(status, data) {

      //document.getElementById('files').type = 'text';
      document.getElementById('files').type = 'file';

      if (status === 'ok') {

        if (files) {
          alert('New CSS set.');
        } else {
          alert('CSS deleted.');
        }

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  };

  var setCss = function() {

    var file = document.getElementById('files').files[0];

    if (!file) {
      makeCssRequest();
      return;
    }

    var reader = new FileReader();

    reader.onloadend = function(e) {

      // style exception, too simple
      makeCssRequest([ {
        name : file.name,
        content : reader.result
      } ]);
      // style exception, too simple

    };

    reader.readAsDataURL(file);

  };
  /* END Functions
  ------------------------------------------------------------*/

  var boardIdentifier;

  if (document.getElementById('ownerControlDiv')) {

    showElement(document.getElementById('addVolunteerJsButton'));
    removeElement(document.getElementById('addVolunteerFormButton'));

    showElement(document.getElementById('transferBoardJsButton'));
    removeElement(document.getElementById('transferBoardFormButton'));

    showElement(document.getElementById('deleteBoardJsButton'));
    removeElement(document.getElementById('deleteBoardFormButton'));

    showElement(document.getElementById('saveSettingsJsButton'));
    removeElement(document.getElementById('saveSettingsFormButton'));

    showElement(document.getElementById('cssJsButton'));
    removeElement(document.getElementById('cssFormButton'));


    boardIdentifier =
      document.getElementById('addVolunteerBoardIdentifier').value;

    var volunteerDiv = document.getElementById('volunteersDiv');

    for (var i = 0; i < volunteerDiv.childNodes.length; i++) {
      processVolunteerCell(volunteerDiv.childNodes[i]);

    }
  }

  setupReportButtons();

}

if (pageId === 'boardModeration') {

  var boardIdentifier;

  document.getElementById('transferJsButton').style.display = 'inline';
  document.getElementById('deleteJsButton').style.display = 'inline';

  document.getElementById('deleteFormButton').style.display = 'none';
  document.getElementById('transferFormButton').style.display = 'none';

  boardIdentifier = document.getElementById('boardTransferIdentifier').value;

}

function transferBoard() {

  apiRequest('transferBoardOwnership', {
    login : document.getElementById('fieldTransferLogin').value.trim(),
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/' + boardIdentifier + '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function deleteBoard() {
  apiRequest('deleteBoard', {
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

if (pageId === 'edit') {
  var boardIdentifier;
  var threadIdentififer;
  var postIdentifier;

  showElement(document.getElementById('saveJsButton'));
  removeElement(document.getElementById('saveFormButton'));

  boardIdentifier = document.getElementById('boardIdentifier').value;

  var threadElement = document.getElementById('threadIdentifier');
  if (threadElement) {
    threadIdentififer = threadElement.value;
  } else {
    postIdentifier = document.getElementById('postIdentifier').value;
  }

  var save = function() {

    var typedMessage = document.getElementById('fieldMessage').value.trim();

    if (!typedMessage.length) {
      alert('A message is mandatory.');
    } else if (typedMessage.length > 2048) {
      alert('Message too long, keep it under 2048 characters.');
    } else {

      var parameters = {
        boardUri : boardIdentifier,
        message : typedMessage
      };

      if (postIdentifier) {
        parameters.postId = postIdentifier;
      } else {
        parameters.threadId = threadIdentififer;
      }

      apiRequest('saveEdit',
                 parameters,
                 function requestComplete(status, data) {
        if (status === 'ok') {
          alert('Posting edited.');
        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

    }

  };


}

if (pageId === 'filterManagement') {

  var boardIdentifier = document.getElementById('boardIdentifier').value;

  document.getElementById('addJsButton').style.display = 'inline';

  document.getElementById('addFormButton').style.display = 'none';

  var filtersDiv = document.getElementById('divFilters');

  for (var j = 0; j < filtersDiv.childNodes.length; j++) {
    processFilterCell(filtersDiv.childNodes[j]);
  }

}

function processFilterCell(cell) {

  var button = cell.getElementsByClassName('deleteJsButton')[0];
  button.style.display = 'inline';

  button.onclick = function() {
    removeFilter(cell.getElementsByClassName('filterIdentifier')[0].value);
  };

  cell.getElementsByClassName('deleteFormButton')[0].style.display = 'none';
}

function removeFilter(filter) {

  apiRequest('deleteFilter', {
    boardUri : boardIdentifier,
    filterIdentifier : filter
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function addFilter() {
  var typedOriginal = document.getElementById('fieldOriginalTerm').value.trim();
  var typedReplacement = document.getElementById('fieldReplacementTerm').value
      .trim();

  if (!typedOriginal.length || !typedReplacement.length) {
    alert('Both fields are mandatory.');
    return;
  } else if (typedOriginal.length > 32 || typedReplacement.length > 32) {
    alert('Both fields cannot exceed 32 characters.');
    return;
  }

  apiRequest('createFilter', {
    boardUri : boardIdentifier,
    originalTerm : typedOriginal,
    replacementTerm : typedReplacement
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

if (pageId === 'globalManagement') {

  document.getElementById('addJsButton').style.display = 'inline';

  document.getElementById('addFormButton').style.display = 'none';

  setupReportButtons();

  var staffDiv = document.getElementById('divStaff');

  for (var i = 0; i < staffDiv.childNodes.length; i++) {
    var cell = staffDiv.childNodes[i];

    processCell(cell);

  }

}

function processCell(cell) {

  var button = cell.getElementsByClassName('saveJsButton')[0];
  button.style.display = 'inline';

  cell.getElementsByClassName('saveFormButton')[0].style.display = 'none';

  var comboBox = cell.getElementsByClassName('roleCombo')[0];
  var user = cell.getElementsByClassName('userIdentifier')[0].value;

  button.onclick = function() {
    saveUser(user, comboBox);
  };
}

function saveUser(user, comboBox) {

  setUser(user, comboBox.options[comboBox.selectedIndex].value);

}

function addUser() {

  var combo = document.getElementById('newStaffCombo');

  setUser(document.getElementById('fieldLogin').value.trim(),
      combo.options[combo.selectedIndex].value);

}

function setUser(login, role) {

  apiRequest('setGlobalRole', {
    login : login,
    role : +role
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

if (pageId === 'hashBans') {

  var boardUri;

  var boardIdentifier = document.getElementById('boardIdentifier');

  if (boardIdentifier) {
    boardUri = boardIdentifier.value;
  }

  document.getElementById('createFormButton').style.display = 'none';
  document.getElementById('createJsButton').style.display = 'inline';

  var hashBansDiv = document.getElementById('hashBansDiv');

  for (var j = 0; j < hashBansDiv.childNodes.length; j++) {
    processHashBanCell(hashBansDiv.childNodes[j]);
  }
}

function processHashBanCell(cell) {

  var button = cell.getElementsByClassName('liftJsButton')[0];
  button.style.display = 'inline';

  button.onclick = function() {
    liftHashBan(cell.getElementsByClassName('idIdentifier')[0].value);
  };

  cell.getElementsByClassName('liftFormButton')[0].style.display = 'none';

}

function liftHashBan(hashBan) {
  apiRequest('liftHashBan', {
    hashBanId : hashBan
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function placeHashBan() {

  var typedHash = document.getElementById('hashField').value.trim();

  var parameters = {
    hash : typedHash
  };

  if (boardUri) {
    parameters.boardUri = boardUri;
  }

  apiRequest('placeHashBan', parameters,
      function requestComplete(status, data) {

        if (status === 'ok') {

          location.reload(true);

        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

}

if (pageId === 'rangeBans') {

  var boardUri;

  var boardIdentifier = document.getElementById('boardIdentifier');

  if (boardIdentifier) {
    boardUri = boardIdentifier.value;
  }

  document.getElementById('createFormButton').style.display = 'none';
  document.getElementById('createJsButton').style.display = 'inline';

  var rangeBansDiv = document.getElementById('rangeBansDiv');

  for (var j = 0; j < rangeBansDiv.childNodes.length; j++) {
    processRangeBanCell(rangeBansDiv.childNodes[j]);
  }
}

function processRangeBanCell(cell) {

  var button = cell.getElementsByClassName('liftJsButton')[0];
  button.style.display = 'inline';

  button.onclick = function() {
    liftBan(cell.getElementsByClassName('idIdentifier')[0].value);
  };

  cell.getElementsByClassName('liftFormButton')[0].style.display = 'none';

}

function liftBan(ban) {
  apiRequest('liftBan', {
    banId : ban
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function placeRangeBan() {

  var typedRange = document.getElementById('rangeField').value.trim();

  var parameters = {
    range : typedRange
  };

  if (boardUri) {
    parameters.boardUri = boardUri;
  }

  apiRequest('placeRangeBan', parameters,
      function requestComplete(status, data) {

        if (status === 'ok') {

          location.reload(true);

        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

}

function setupReportButtons() {

  var reportDiv = document.getElementById('reportDiv');

  for (var j = 0; j < reportDiv.childNodes.length; j++) {
    processReportCell(reportDiv.childNodes[j]);
  }
}

function processReportCell(cell) {

  var button = cell.getElementsByClassName('closeJsButton')[0];
  button.style.display = 'inline';

  button.onclick = function() {
    closeReport(cell.getElementsByClassName('idIdentifier')[0].value);
  };

  cell.getElementsByClassName('closeFormButton')[0].style.display = 'none';

}

function closeReport(report) {
  apiRequest('closeReport', {
    reportId : report
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

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
          alert(status+': '+JSON.stringify(data));
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
      alert('You can\'t inform a blank rule.');

    } else if (typedRule.length > 512) {
      alert('Rule too long, keep in under 512 characters.');
    } else {

      apiRequest('createRule', {
        boardUri : boardIdentifier,
        rule : typedRule,
      }, function requestComplete(status, data) {
        if (status === 'ok') {
          location.reload(true);
        } else {
          alert(status+': '+JSON.stringify(data));
        }
      });
    }
  };

}
