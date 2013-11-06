(function(){
  var origTitle = document.querySelector('title').innerHTML;
  
  var bkURLDeferred = $.Deferred();
  
  chrome.storage.sync.get(['bkurl','expTitleEnchance', 'faviconNewItemFeedCountEnhance'], function(items){
    bkURLDeferred.resolve(items.bkurl, items.expTitleEnchance, items.faviconNewItemFeedCountEnhance);
  });
  
  var injectTitleEnhanceScript = function(){
    var title = origTitle;
    
    var navTabActive = $('.nav-tabs > .active').text().trim();
    var spaceTitle = $('h2 > .max70.ellipsis');
    var navItems = document.querySelectorAll('.page_footer > .railway > li');

    if(navTabActive){
      title = navTabActive;
    }else if(spaceTitle.text()){
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
    
    //reset title when the popup is removed
    // select the target node
    var target = document.querySelector('body');
    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //console.log(mutation);
        if(mutation.removedNodes.length){
          for(var i=0; i<mutation.removedNodes.length; i++){
            var node = mutation.removedNodes[i];
            if(node.id && node.id === 'modale_preview'){
              document.querySelector('title').innerHTML = origTitle;
            }
          }
        }else if(mutation.target.id && mutation.target.id === 'modale_preview'){
          var title = origTitle;
          var postTitle = $(mutation.target).find('.post_title');
          var h1 = $(mutation.target).find('h1');
          if(postTitle){
            title = postTitle.text();
          }else if(h1){
            title = h1.text();
          }
          document.querySelector('title').innerHTML = title;
        }
      });    
    });
    // configuration of the observer:
    var config = {childList: true, subtree: true};
    // pass in the target node, as well as the observer options
    observer.observe(target, config);

  };
  
  var injectItemFeedCountFaviconScript = function(){
    var favicon=new Favico({
      animation:'slide'
    });
    
    var extractNewFeedItemCount = function(node){
      var newFeedItemMatches = $(node).text().match(/^(\d*)/g);
      if(newFeedItemMatches && newFeedItemMatches[0]){
        var newFeedItemCount = newFeedItemMatches[0];
        favicon.badge(newFeedItemCount);
      }else{
        favicon.badge(0);
      }
    };
  
    var target = document.querySelector('#module_feeds_list');
    if(!target) return;
    
    // create an observer instance
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if(mutation.target === target){
          for(var i=0; i<mutation.addedNodes.length; i++){
            var node = mutation.addedNodes[i];
            if($(node).hasClass('items_new')){
              extractNewFeedItemCount(node);
            }
          }
        }else if(mutation.type === 'characterData'){
          console.log(mutation);
          if($(mutation.target).hasClass('items_new')){
            extractNewFeedItemCount(mutation.target);
          }
        }
      });    
    }).observe(target, {childList: true, subtree: true, characterData: true});
  };
  

  bkURLDeferred.done(function(bkurl, expTitleEnchance, faviconNewItemFeedCountEnhance){
    if(document.URL.indexOf(bkurl) == 0){
      if(expTitleEnchance){
        injectTitleEnhanceScript();
      }
      if(faviconNewItemFeedCountEnhance){
        injectItemFeedCountFaviconScript();
      }
    }
  });

})();




