if (pageId === 'catalog') {

  /* =Functions
     ============================================================*/
  var expandCatalogOp = function(e) {
    /* If click is on image link, just follow it */
    if (e.target.parentNode.className.indexOf('linkThumb') > -1 ||
        e.target.className.indexOf('linkThumb') > -1) {
      return true;
    }

    var content = e.currentTarget
    .getElementsByClassName('catalogCellContent')[0];
    if (content.style.overflowY === 'auto') {
      content.style.overflowY = '';
    } else {
      content.style.overflowY = 'auto';
    }
  };

  var catalogCellLinkHover = function(e) {
    /* Get caller's containing cell */
    /* assume: <a>=>.catalogThread=>.catalogCell */
    var cell = e.currentTarget.parentNode.parentNode;
    /* if false, then event caller is .catalogThreadDetails */
    if (!hasClass(cell, 'catalogCell')) {
      /* .linkThumb=>.catalogCellHeader=>.catalogCellContent=>
       *  .catalogThread=>.catalogCell */
      cell = cell.parentNode.parentNode;
    }
    /*------------------------------*/

    var type = e.type;
    if (type === 'mouseenter') {
      addClass(cell, 'catalogCellLinkHover');
    } else if (type === 'mouseleave') {
      removeClass(cell, 'catalogCellLinkHover');
    }
  };

  /* =Initialization
     ============================================================*/
  /* Hide details if empty */
  var labelsReplies = document.getElementsByClassName('labelReplies');
  for (var i = 0; i < labelsReplies.length; ++i) {
    if (labelsReplies[i].innerHTML === '0') {
      labelsReplies[i].style.display = 'none';
    }
  }
  var labelsImages = document.getElementsByClassName('labelImages');
  for (var i = 0; i < labelsImages.length; ++i) {
    if (labelsImages[i].innerHTML === '0') {
      labelsImages[i].style.display = 'none';
    }
  }

  /* Set details area as link to thread#bottom */
  var catalogThreads =
    document.getElementsByClassName('catalogThread');
  for (var i = 0, thread, threadUrl, details;
       i < catalogThreads.length;
       ++i) {
    thread = catalogThreads[i];
    threadUrl = thread.getElementsByClassName('linkThumb')[0]
      .getAttribute('href');
    details = thread.getElementsByClassName('catalogThreadDetails')[0];
    
    var link = document.createElement('a');
    link.setAttribute('href', threadUrl+'#bottom');
    thread.appendChild(link);
    link.appendChild(details);

    link.onmouseenter = catalogCellLinkHover;
    link.onmouseleave = catalogCellLinkHover;
  }

}
