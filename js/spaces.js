$.ajaxSetup({timeout:30 * 1000}); 

function loadSpaces(bkurl){
  var spacesURL = bkurl + SETTINGS_SPACES_URL;
  console.log('spacesURL='+spacesURL);
  //https://zen.myatos.net/user/in/Anthony_Lau/settings/spaces 
  $.get(spacesURL, function(data){
    var spacesPage = $(data);
    var sapcesTable = spacesPage.find('table.settings_table');
    sapcesTable.find('tr td:nth-child(1) a').each(function(idx,el){
      var spaceURL = bkurl + $(el).attr('href');
      $(el).attr('href', spaceURL);
      $(el).attr('target', '_blank');
      console.log('spaceURL='+spaceURL);
      $('#space-list').append($('<div></div>').append(el));
    });
    $('#space-list').show();
    $('#loading').hide();
  },'html');
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