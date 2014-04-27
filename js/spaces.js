$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var pageURL = bkurl + '/dashboard/welcome';
  console.log('pageURL='+pageURL);
  
	$.get(pageURL,{ dataType: 'html' })
  .then(function(data){
    //var tmp = $(data).find('a[href^="/user/in"][href*="profile"]').attr('href');
	  var userID = /\/user\/in\/(.*)\/settings(.*)/g.exec(data)[1];
	  var spacesURL = bkurl + '/user/in/' + userID + '/settings/spaces';
    console.log('userID='+userID);
	  return $.get(spacesURL,{ dataType: 'html' });
  }).done(function(data){
    var spacesTable = $(data);
    var spacelist = $('#space-list');
    var spaces = [];
    spacesTable.find('tr td:nth-child(1)').each(function(idx,el){
      spaces.push({
        spaceURL: $(el).find('a').attr('href'),
        spaceName: $(el).find('a').text(),
        spaceType: $(el).find('.space_type').text()
      });
    });
    spaces.sort(function(a,b){
      if (a.spaceName.toLowerCase() < b.spaceName.toLowerCase())
        return -1;
      if (a.spaceName.toLowerCase() > b.spaceName.toLowerCase())
        return 1;
      return 0;
    });
    chrome.storage.local.set({bkSpacesCache: spaces});
    renderSpaces(spaces);
    $('#loading').hide();
	}).fail(function(jqXHR, textStatus, errorThrown){
	    console.log('failed to fetch space list, ' + textStatus + '-' + errorThrown);
	    $('#loading').hide();
		var errorMsg = document.getElementById("status");
		errorMsg.innerHTML = "<div class='alert enter-url'>You need to enter a blueKiwi URL in the <a href='options.html' target='_blank'>Options</a> page before you can begin</div>";
	    ga('send', 'event', 'space-list' , 'fail' , textStatus + '-' + errorThrown);
	});	
}

function renderSpaces(spaces){
  if(spaces){
    chrome.storage.sync.get('staredSpaceURLs', function(items){
      var staredSpaceURLs = items.staredSpaceURLs || [];
      $('#space-listtbl-body').empty();
      for(var i=0; i<spaces.length; i++){
        var space = spaces[i];
        var spaceURL= space.spaceURL;
        if(~staredSpaceURLs.indexOf(spaceURL)){
          space.spaceStared = true;
        }else{
          space.spaceStared = false;
        }
      }
      spaces.sort(function(a,b){
        if (a.spaceStared && !b.spaceStared )
          return -1;
        if (!a.spaceStared && b.spaceStared)
          return 1;
        if (a.spaceStared == b.spaceStared){
          if (a.spaceName.toLowerCase() < b.spaceName.toLowerCase())
            return -1;
          if (a.spaceName.toLowerCase() > b.spaceName.toLowerCase())
            return 1;
        }
        return 0;
      });
      for(var i=0; i<spaces.length; i++){
        var space = spaces[i];
        var spaceURL= space.spaceURL;
        var spaceName = space.spaceName;
        var spaceType = space.spaceType;
        var spaceStared = space.spaceStared;
        var star = $('<div></div>');

        //star.text(spaceStared?'★':'☆');
        
        if(spaceStared){
          star.addClass('fa fa-star');
        }else{
          star.addClass('fa fa-star-o');
        }
        
        star.click(function(){
          var s = space;
          return function(){
            s.spaceStared = !s.spaceStared;
            //$(this).text(s.spaceStared?'★':'☆');
            
            if(s.spaceStared){
              $(this).removeClass('fa fa-star-o');
              $(this).addClass('fa fa-star');
              putStaredSpace(s);
            }else{
              $(this).removeClass('fa fa-star');
              $(this).addClass('fa fa-star-o');
              removeStartedSpace(s);
            }
            
          };
        }());
        
        var space = $('<a></a>').attr('href', spaceURL)
          .attr('target', '_blank').html(spaceName + '[' + spaceType + ']');
        $('#space-listtbl-body').append(
          $('<tr></tr>').append(
            $('<td></td>').append(star).append(space)
          )
        );
      }
    });
  }
}

function putStaredSpace(space){
  var url = space.spaceURL;
  chrome.storage.sync.get('staredSpaceURLs', function(items){
    var urls = items.staredSpaceURLs || [];
    if(urls.indexOf(url) <= 0){
      urls.push(url);
      chrome.storage.sync.set({staredSpaceURLs: urls});
    }
	});
}

function removeStartedSpace(space){
  var url = space.spaceURL;
  chrome.storage.sync.get('staredSpaceURLs', function(items){
    var urls = items.staredSpaceURLs || [];
    var urlIdx = urls.indexOf(url);
    if(~urlIdx){
      urls.splice(urlIdx,1);
      chrome.storage.sync.set({staredSpaceURLs: urls});
    }
	});
}

document.addEventListener('DOMContentLoaded', function () {
	console.log("DOMContentLoaded");
	chrome.storage.sync.get('bkurl', function(items){
    loadSpaces(items.bkurl);
	});
  chrome.storage.local.get('bkSpacesCache', function(items){
    renderSpaces(items.bkSpacesCache);
	});
	$('#btnHome').click(function(){
    ga('send', 'event', 'popup-home-btn', 'clicked');
		chrome.storage.sync.get('bkurl', function(items){
      chrome.tabs.create({ url: items.bkurl });
		});
	});

});