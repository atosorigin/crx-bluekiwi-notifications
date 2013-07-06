$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){

	$.get(bkurl + '/dashboard/welcome' ,{ dataType: 'html' })
  .then(function(data){
    var tmp = $(data).find('a[href^="/user/in"]').attr('href');
	   console.log(tmp);
	   var userID = /\/user\/in\/(.*)\/.*/g.exec(tmp)[1];
	   var spacesURL = bkurl + '/user/in/' + userID + '/settings/spaces';
	
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