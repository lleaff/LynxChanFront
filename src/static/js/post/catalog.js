if (pageId === 'catalog') {
  var expandCatalogOp = function(e) {
    var content = e.currentTarget
      .getElementsByClassName('catalogCellContent')[0];
    if (content.style.overflowY === 'auto') {
      content.style.overflowY = '';
    } else {
      content.style.overflowY = 'auto';
    }
  };
}
