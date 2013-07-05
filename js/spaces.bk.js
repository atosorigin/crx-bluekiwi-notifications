$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var spacesURL = bkurl + SETTINGS_SPACES_URL;
  console.log('spacesURL='+spacesURL);
  //https://zen.myatos.net/user/in/Anthony_Lau/settings/spaces 
  $.get(spacesURL, function(data){
    var spacesPage = $(data);
    var spacelist = $('#space-list');
   spacesPage.find('.item_to_preview').each(function(idx,el){
      var avatarImg = $(el).find('.avatar img');
      var avatarImgSrc;
      if(avatarImg){
        avatarImgSrc = avatarImg.attr('src');
      }
      var aspace = $(el).find('.item_content a.post_title');
      var spaceName = aspace.text();
      var spaceURL = bkurl + aspace.attr('href');
      console.log('spaceName='+spaceName+',spaceURL='+spaceURL+',avatarImgSrc='+avatarImgSrc);
      
      var media = $('<div class="media"/>');
      media.appendTo(spacelist);
      media.click((function(spaceURL) {
					return function() {
						_gaq.push(['_trackEvent', 'space-item', 'clicked']);
						chrome.tabs.create({ url: spaceURL });
					};
				})(spaceURL));
      var avatarContainer = $('<a class="pull-left" href="#"/>');
      avatarContainer.appendTo(media);
      var avatar = $('<img class="avatar"/>');
      avatar.appendTo(avatarContainer);
      avatar.attr('src',avatarImgSrc);
      
      var content = $('<div class="media-body"/>');
      content.appendTo(media);
      content.html(spaceName);
    });
    /*
    spacesTable.find('tr td:nth-child(1) a').each(function(idx,el){
      var spaceURL = bkurl + $(el).attr('href');
      $(el).attr('href', spaceURL);
      $(el).attr('target', '_blank');
      console.log('spaceURL='+spaceURL);
      $('#space-list').append($('<div></div>').append(el));
    });*/
    
    $('#space-list').show();
    $('#loading').hide();
  },'html')
  .fail(function(jqXHR, textStatus, errorThrown){
    console.log('failed to fetch space list, ' + textStatus + '-' + errorThrown);
    _gaq.push(['_trackEvent', 'space-list' , 'fail' , textStatus + '-' + errorThrown]);
  });
}

document.addEventListener('DOMContentLoaded', function () {
	console.log("DOMContentLoaded");
	chrome.storage.sync.get('bkurl', function(items){
    loadSpaces(items.bkurl);
	});
	$('#btnHome').click(function(){
    _gaq.push(['_trackEvent', 'popup-home-btn', 'clicked']);
		chrome.storage.sync.get('bkurl', function(items){
			chrome.tabs.create({ url: items.bkurl });
		});
	});

});