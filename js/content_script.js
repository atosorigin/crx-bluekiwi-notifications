(function(){
  var origTitle = document.querySelector('title').innerHTML;
  
  var bkURLDeferred = $.Deferred();
  
  chrome.storage.sync.get(['bkurl','expTitleEnchance'], function(items){
    bkURLDeferred.resolve(items.bkurl, items.expTitleEnchance);
  });
  
  var injectScript = function(){
    var title = origTitle;
    
    var spaceTitle = $('h2 > .max70.ellipsis');
    var navItems = document.querySelectorAll('.page_footer > .railway > li');

    if(spaceTitle.text()){
      var nav1 = spaceTitle.text().replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ').trim();
      //var nav2 = spaceTitle.parent().contents().filter(function(){return this.nodeType == 3;}).last().text().replace(/(\r\n|\n|\r|\/)/gm,"").replace(/\s+/gm,' ').trim();
      //not work if the sub title has link
      //title = nav1 + ' » ' + nav2;
      title = nav1;
    }else if (navItems){
      var nav1 = navItems[1]?navItems[1].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
      var nav2 = navItems[2]?navItems[2].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
      title = (nav1 + nav2).trim();
    }
    
    document.querySelector('title').innerHTML = title;
    origTitle = title;
    
    $(document).bind('DOMSubtreeModified',function(e,a){
      if(e.target.attributes['id'] &&  e.target.attributes['id'].value === 'modale_preview'){
        console.log('test');
        var title = origTitle;
        var postTitle = $(e.target).find('.post_title');
        var h1 = $(e.target).find('h1');
        if(postTitle){
          title = postTitle.text();
        }else if(h1){
          title = h1.text();
        }
        document.querySelector('title').innerHTML = title;
        
        //reset title when the popup is removed
        // select the target node
        var target = document.querySelector('body');
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            //console.log(mutation.removedNodes);
            if(mutation.removedNodes.length){
              for(var i=0; i<mutation.removedNodes.length; i++){
                var node = mutation.removedNodes[i];
                if(node.id && node.id === 'modale_preview'){
                  observer.disconnect();
                  document.querySelector('title').innerHTML = origTitle;
                }
              }
            }
          });    
        });
        // configuration of the observer:
        var config = {childList: true};
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
      } 
    });
  };

  bkURLDeferred.done(function(bkurl, expTitleEnchance){
    if(document.URL.indexOf(bkurl) == 0){
      if(expTitleEnchance){
        injectScript();
      }
    }
  });
})();




