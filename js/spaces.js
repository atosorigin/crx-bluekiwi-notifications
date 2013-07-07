$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var pageURL = bkurl + '/dashboard/welcome';
  console.log('pageURL='+pageURL);
	$.get(pageURL,{ dataType: 'html' })
  .then(function(data){
    var tmp = $(data).find('a[href^="/user/in"][href*="settings"]').attr('href');
	  var userID = /\/user\/in\/(.*)\/settings(.*)/g.exec(tmp)[1];
	  var spacesURL = bkurl + '/user/in/' + userID + '/settings/spaces';
    console.log('userID='+userID);
	  return $.get(spacesURL,{ dataType: 'html' });
  }).done(function(data){
    var spacesTable = $(data);
    var spacelist = $('#space-list');
    var spaces = [];
    spacesTable.find('tr td:nth-child(1)').each(function(idx,el){
      spaces.push({
        spaceURL: bkurl + $(el).find('a').attr('href'),
        spaceName: $(el).find('a').text(),
        spaceType: $(el).find('.space_type').text()
      });
    });
    spaces.sort(function(a,b){
      if (a.spaceName < b.spaceName)
        return -1;
      if (a.spaceName > b.spaceName)
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
      var spaceURL= spaces[i].spaceURL;
      var spaceName = spaces[i].spaceName;
      var spaceType = spaces[i].spaceType;
      var space = $('<a></a>').attr('href', spaceURL)
        .attr('target', '_blank').html(spaceName + '[' + spaceType + ']');
      $('#space-listtbl-body').append(
        $('<tr></tr>').append(
          $('<td></td>').append(space)
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
    console.log(items);
    renderSpaces(items.bkSpacesCache);
	});
	$('#btnHome').click(function(){
    _gaq.push(['_trackEvent', 'popup-home-btn', 'clicked']);
		chrome.storage.sync.get('bkurl', function(items){
			chrome.tabs.create({ url: items.bkurl });
		});
	});

});