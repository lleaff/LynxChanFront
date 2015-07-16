if (pageId === 'account') {
  bodyOnLoadStack.push(function() {

    showElement(document.getElementById('logoutJsButton'));
    showElement(document.getElementById('newBoardJsButton'));
    showElement(document.getElementById('saveJsButton'));
    showElement(document.getElementById('passwordJsButton'));

    removeElement(document.getElementById('passwordFormButton'));
    removeElement(document.getElementById('saveFormButton'));
    removeElement(document.getElementById('logoutFormButton'));
    removeElement(document.getElementById('newBoardFormButton'));

  });
}
