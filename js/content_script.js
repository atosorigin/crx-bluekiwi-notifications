(function(){
  var origTitle = document.querySelector('title').innerHTML;
  
  var bkURLDeferred = $.Deferred();
  
  chrome.storage.sync.get(['bkurl','expTitleEnchance', 'faviconNewItemFeedCountEnhance'], function(items){
    bkURLDeferred.resolve(items.bkurl, items.expTitleEnchance, items.faviconNewItemFeedCountEnhance);
  });
  
  var injectTitleEnhanceScript = function(){
    var pageTitle = origTitle;
    var title = pageTitle;
    
    var navTabActive = $('.nav-tabs > .active').text().trim();
    var spaceTitle = $('h2 > .max70.ellipsis');
    var navItems = document.querySelectorAll('.page_footer > .railway > li');
    var feedTitle = $('.all_news_selected.browse_title.browse_title_to_modify').text();

    if(navTabActive){
      pageTitle = navTabActive;
    }else if(spaceTitle.text()){
      var nav1 = spaceTitle.text().replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ').trim();
      //var nav2 = spaceTitle.parent().contents().filter(function(){return this.nodeType == 3;}).last().text().replace(/(\r\n|\n|\r|\/)/gm,"").replace(/\s+/gm,' ').trim();
      //not work if the sub title has link
      //title = nav1 + ' » ' + nav2;
      pageTitle = nav1;
    }else if (navItems){
      var nav1 = navItems[1]?navItems[1].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
      var nav2 = navItems[2]?navItems[2].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
      pageTitle = (nav1 + nav2).trim();
    }
    
    title = pageTitle;
    
    if(feedTitle){
      title = pageTitle + ' » ' + feedTitle.trim();
    }
    
    document.querySelector('title').innerHTML = title;
    
    var target = document.querySelector('body');
    //monitor popup
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //console.log(mutation);
        if(mutation.removedNodes.length){
          for(var i=0; i<mutation.removedNodes.length; i++){
            var node = mutation.removedNodes[i];
            if(node.id && node.id === 'modale_preview'){
              document.querySelector('title').innerHTML = title;
              break;
            }
          }
        }else if(mutation.target.id && mutation.target.id === 'modale_preview'){
          var newTitle = title;
          var postTitle = $(mutation.target).find('.post_title');
          var h1 = $(mutation.target).find('h1');
          if(postTitle){
            newTitle = postTitle.text();
          }else if(h1){
            newTitle = h1.text();
          }
          document.querySelector('title').innerHTML = newTitle;
        }
      });    
    }).observe(target, {childList: true, subtree: true});
    
    //monitor feedTitle changes
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //console.log(mutation);
        if(mutation.type === 'characterData'){
          //console.log('feed title change = ' + mutation.target.textContent.trim());
          feedTitle = mutation.target.textContent.trim();
          title = pageTitle + ' » ' + feedTitle;
          document.querySelector('title').innerHTML = title;
        }
      })
    }).observe(document.querySelector('.all_news_selected.browse_title.browse_title_to_modify'),{subtree: true, characterData: true});
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
        /*if(mutation.target.className !== 'timeago'){
          console.log(mutation);
        }*/
        if(mutation.target === target){
          //trace items_new creation
          for(var i=0; i<mutation.addedNodes.length; i++){
            var node = mutation.addedNodes[i];
            if($(node).hasClass('items_new')){
              extractNewFeedItemCount(node);
              break;
            }
          }
          
          //trace items_new removed
          for(var i=0; i<mutation.removedNodes.length; i++){
            var node = mutation.removedNodes[i];
            if($(node).hasClass('items_new')){
              favicon.badge(0);
              break;
            }
          }
        }else if(mutation.type === 'characterData' && mutation.target.parentElement
          && $(mutation.target.parentElement).hasClass('items_new')){
          //trace items_new text updated
           extractNewFeedItemCount(mutation.target);
        }
      });    
    }).observe(target, {childList: true, subtree: true, characterData: true});
  };
  
  var injectArchiveButton = function(bkurl){
    console.log('injectArchiveButton');
    var endswith = function(str,suffix){
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    if(endswith(location.pathname, '/post')){
      console.log('is a post')
      var actionbar = $('.bkaction[data-load-module="post/post.actionbar"]');
      var archive = $('<li class="action_box tooltip-toggle"><a herf="#"><span class="bkpicto picto-archiveBlack"></span>Archive</a></li>');
      archive.click(function(){
        var url = bkurl + '/post/hide/set?postId='+location.search.replace("?id=","");
        console.log(url);
        $.get(url, function(){
          alert('archived!');
        }).fail(function(){alert('Unable to archive')});
      });
      console.log('append archive button');
      actionbar.append(archive);
    }
    
  };

  bkURLDeferred.done(function(bkurl, expTitleEnchance, faviconNewItemFeedCountEnhance){
    console.log('bkurl='+bkurl);
    if(document.URL.indexOf(bkurl) == 0){
      if(expTitleEnchance){
        try{
          injectTitleEnhanceScript();
        }catch(e){
          console.log(e);
        }
      }
      if(faviconNewItemFeedCountEnhance){
        try{
          injectItemFeedCountFaviconScript();
        }catch(e){
          console.log(e);
        }
      }
      //injectArchiveButton(bkurl);
    }
  });

})();




