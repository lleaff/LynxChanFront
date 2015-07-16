if (pageId === 'account') {
  bodyOnLoadStack.push(function() {

    document.getElementById('logoutJsButton').style.display = 'inline';
    document.getElementById('newBoardJsButton').style.display = 'inline';
    document.getElementById('saveJsButton').style.display = 'inline';
    document.getElementById('passwordJsButton').style.display = 'inline';

    document.getElementById('passwordFormButton').style.display = 'none';
    document.getElementById('saveFormButton').style.display = 'none';
    document.getElementById('logoutFormButton').style.display = 'none';
    document.getElementById('newBoardFormButton').style.display = 'none';

  });
}
