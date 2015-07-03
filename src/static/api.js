function handleConnectionResponse(xhr, delegate) {
  var response;

  try {
    response = JSON.parse(xhr.responseText);

    if (VERBOSE) {
      console.log(xhr.responseText);
    }
  } catch (error) {
    alert('Error in parsing response.');
    return;
  }

  if (response.auth && response.auth.authStatus === 'expired') {
    document.cookie = 'hash=' + response.auth.newHash;

  }

  if (response.status === 'error') {
    alert('Internal server error. ' + response.data);
  } else if (response.status === 'blank') {
    alert('Parameter ' + response.data + ' was sent in blank.');
  } else if (response.status === 'tooLarge') {
    alert('Request refused because it was too large');
  } else if (response.status === 'construction') {
    alert('This page is under construction. Come back later, your grandma is almost done sucking me.');
  } else if (response.status === 'denied') {
    alert('You are not allowed to perform this operation.');
  } else if (response.status === 'banned') {
    if (response.data.range) {
      alert('Your ip range ' + response.data.range + ' has been banned from '
          + response.data.board + '.');
    } else {

      alert('You are banned from ' + response.data.board + ' until '
          + new Date(response.data.expiration).toString() + '.\nReason: '
          + response.data.reason + '.\nYour ban id: ' + response.data.banId);
    }
  } else {
    delegate(response.status, response.data);
  }

}

// Makes a request to the back-end.
// page: url of the api page
// parameters: parameter block of the request
// delegate: callback that will receive (data,status). If the delegate has a
// function in stop property, it will be called when the connection stops
// loading.
function apiRequest(page, parameters, delegate) {
  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('POST', API_DOMAIN + page, true);
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('POST', API_DOMAIN + page);
  } else {
    alert('This site can\'t run js on your shitty browser because it does not support CORS requests. Disable js and try again.');

    return;
  }

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState == 4) {

      if (delegate.hasOwnProperty('stop')) {
        delegate.stop();
      }

      if (xhr.status != 200) {
        alert('Connection failed.');
        return;
      }

      handleConnectionResponse(xhr, delegate);
    }
  };

  var parsedCookies = {};

  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {

    var cookie = cookies[i];

    var parts = cookie.split('=');
    parsedCookies[parts.shift().trim()] = decodeURI(parts.join('='));

  }

  var body = {
    captchaId : parsedCookies.captchaid,
    parameters : parameters,
    auth : {
      login : parsedCookies.login,
      hash : parsedCookies.hash
    }
  };

  if (VERBOSE) {
    console.log(JSON.stringify(body));
  }

  xhr.send(JSON.stringify(body));

}

function localRequest(address, callback) {

  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('GET', address, true);
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('GET', address);
  } else {
    alert('This site can\'t run js on your shitty browser because it does not support CORS requests. Disable js and try again.');
    return;
  }

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState == 4) {

      if (callback.hasOwnProperty('stop')) {
        callback.stop();
      }

      if (xhr.status != 200) {
        callback('Connection failed');
      } else {
        callback(null, xhr.responseText);
      }

    }
  };

  xhr.send();
}