if (pageId === 'login') {
  showElement(document.getElementById('registerJsButton'));
  showElement(document.getElementById('loginJsButton'));
  showElement(document.getElementById('recoverJsButton'));

  removeElement(document.getElementById('recoverFormButton'));
  removeElement(document.getElementById('registerFormButton'));
  removeElement(document.getElementById('loginFormButton'));
}
