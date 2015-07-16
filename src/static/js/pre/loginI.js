if (pageId === 'login') {
  bodyOnLoadStack.push(function() {

    document.getElementById('registerJsButton').style.display = 'inline';
    document.getElementById('loginJsButton').style.display = 'inline';
    document.getElementById('recoverJsButton').style.display = 'inline';

    document.getElementById('recoverFormButton').style.display = 'none';
    document.getElementById('registerFormButton').style.display = 'none';
    document.getElementById('loginFormButton').style.display = 'none';

  });
}

