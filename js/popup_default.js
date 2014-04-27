document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.sync.get('popupDefaultPage', function(items){
    if(items.popupDefaultPage == 'spaces'){
      document.location = 'spaces.html';
    }else if(items.popupDefaultPage == 'notifications'){
      document.location = 'popup.html';
    }else{
      document.location = 'popup.html';
    }
	});
});