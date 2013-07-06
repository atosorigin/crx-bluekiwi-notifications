$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var pageURL = bkurl + '/dashboard/welcome';
  console.log('pageURL='+pageURL);
	$.get(pageURL,{ dataType: 'html' })
  .then(function(data){
    var tmp = $(data).find('a[href^="/user/in"][href*="settings"]').attr('href');
	  console.log(tmp);
	  var userID = /\/user\/in\/(.*)\/settings(.*)/g.exec(tmp)[1];
	  var spacesURL = bkurl + '/user/in/' + userID + '/settings/spaces';
    console.log('userID='+userID);
	  return $.get(spacesURL,{ dataType: 'html' });
  }).done(function(data){
    var spacesTable = $(data);
    var spacelist = $('#space-list');
      console.log(spacesTable); 
    spacesTable.find('tr td:nth-child(1)').each(function(idx,el){
      var spaceURL = bkurl + $(el).find('a').attr('href');
      var spaceName = $(el).find('a').text();
      var spaceType = $(el).find('.space_type').text();
      console.log(spaceURL);
      var space = $('<a></a>').attr('href', spaceURL)
        .attr('target', '_blank').html(spaceName + '[' + spaceType + ']');
      $('#space-listtbl tbody').append('<tr><td></td></tr>');
      $('#space-listtbl tbody tr:last td').append(space);
    });
    
    $('#space-list').show();
    $('#loading').hide();
	}).fail(function(jqXHR, textStatus, errorThrown){
	    console.log('failed to fetch space list, ' + textStatus + '-' + errorThrown);
	    $('#loading').hide();
		var errorMsg = document.getElementById("status");
		errorMsg.innerHTML = "<div class='alert enter-url'>You need to enter a blueKiwi URL in the <a href='options.html' target='_blank'>Options</a> page before you can begin</div>";
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