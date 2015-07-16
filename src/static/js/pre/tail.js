document.onreadystatechange = function() {
  if (document.readyState === 'interactive') {
    bodyOnLoadStack.forEach(function(fn) {
      fn();
    });
  }
};
