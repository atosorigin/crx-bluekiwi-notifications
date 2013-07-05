$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var spacesURL = 'https://zen.myatos.net/user/in/Greg_Hesp/settings/spaces';
  $.get(spacesURL, function(data){
    var spacesTable = $(data);
    var spacelist = $('#space-list');
      console.log(spacesTable); 
    spacesTable.find('tr td:nth-child(1) a').each(function(idx,el){
      var spaceURL = bkurl + $(el).attr('href');
      console.log(spaceURL);
      $(el).attr('href', spaceURL);
      $(el).attr('target', '_blank');
      $('#space-listtbl tbody').append('<tr><td></td></tr>');
      $('#space-listtbl tbody tr:last td').append(el);
    });
    
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