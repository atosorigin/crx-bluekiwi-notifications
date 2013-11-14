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
	    _gaq.push(['_trackEvent', 'space-list' , 'fail' , textStatus + '-' + errorThrown]);
	});	
}

function renderSpaces(spaces){
  if(spaces){
    $('#space-listtbl-body').empty();
    for(var i=0; i<spaces.length; i++){
      var space = spaces[i];
      var spaceURL= spaces[i].spaceURL;
      var spaceName = spaces[i].spaceName;
      var spaceType = spaces[i].spaceType;
      var spaceStared = spaces[i].spaceStared;
      var star = $('<div class="icon-star-empty" style="display: inline-block; font-size: 1.5em; cursor: pointer"></div>');

      //star.text(spaceStared?'★':'☆');
      if(spaceStared){
        star.addClass('icon-star');
      }else{
        star.addClass('icon-star-empty');
      }
      star.click(function(){
        var s = space;
        return function(){
          s.spaceStared = !s.spaceStared;
          //$(this).text(s.spaceStared?'★':'☆');
          if(s.spaceStared){
            $(this).removeClass('icon-star-empty');
            $(this).addClass('icon-star');
          }else{
            $(this).removeClass('icon-star');
            $(this).addClass('icon-star-empty');
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
  }
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
    _gaq.push(['_trackEvent', 'popup-home-btn', 'clicked']);
		chrome.storage.sync.get('bkurl', function(items){
			chrome.tabs.create({ url: items.bkurl });
		});
	});

});