$.ajaxSetup({timeout:30 * 1000}); 

function loadCalendar(bkurl){
  var pageURL = bkurl + '/dashboard/welcome';
  console.log('pageURL='+pageURL);
  var userID = null;
	$.get(pageURL,{ dataType: 'html' })
  .then(function(data){
    var tmp = $(data).find('a[href^="/user/in"][href*="settings"]').attr('href');
	  userID = /\/user\/in\/(.*)\/settings(.*)/g.exec(tmp)[1];
    
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    console.log('firstDay=' + firstDay.getTime() + ';' + 'lastDay=' + lastDay.getTime());
    
	  var calendarURL = bkurl + '/user/in/' + userID + '/newCalendar';
    console.log('userID='+userID);
	  return $.get(calendarURL, {start: firstDay.getTime()/1000, end: lastDay.getTime()/1000});
  }).done(function(data){
    if(data){
      var events = $.parseJSON(data);
      chrome.storage.local.set({bkCalendarCache: events});
      renderEvents(events, bkurl, userID);
      $('#loading').hide();
    }else{
      console.log('no calendar event');
    }
	}).fail(function(jqXHR, textStatus, errorThrown){
	    console.log('failed to fetch calendar events, ' + textStatus + '-' + errorThrown);
	    $('#loading').hide();
		var errorMsg = document.getElementById("status");
		errorMsg.innerHTML = "<div class='alert enter-url'>You need to enter a blueKiwi URL in the <a href='options.html' target='_blank'>Options</a> page before you can begin</div>";
	    _gaq.push(['_trackEvent', 'calendar-event-list' , 'fail' , textStatus + '-' + errorThrown]);
	});	
}

function renderEvents(events, bkurl, userID){
  $('#calendar-listtbl-body').empty();
  if(events){
    console.log(events);
    for(var i=0; i<events.length; i++){
      var event = events[i];
      console.log(event.title);
      var eventEl = $('<a></a>').attr('href', bkurl + '/user/in/' + userID + '/post?id=' + event.id)
          .attr('target', '_blank').html(event.title);
      var tr = $('<tr></tr>');
      var td = $('<td></td>').append(eventEl)
      tr.append(td);
      $('#calendar-listtbl-body').append(tr);
    }
  }
  //https://zen.myatos.net/user/in/Anthony_Lau/post?id=758373
  //https://zen.myatos.net/user/in/Anthony_Lau/newCalendar?start=1372608000&end=1376236800&_=1374947745380
  //[{"id":1317727,"title":"Test Event","start":"2013-07-24T12:00:00+08:00",
  //"end":"2013-07-27T12:00:00+08:00",
  //"allDay":true,"editable":false,
  //"color":"#CC6906"}]
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
    loadCalendar(items.bkurl);
	});
  chrome.storage.local.get('bkCalendarCache', function(items){
    console.log(items);
    renderEvents(items.bkCalendarCache);
	});
	$('#btnHome').click(function(){
    _gaq.push(['_trackEvent', 'popup-home-btn', 'clicked']);
		chrome.storage.sync.get('bkurl', function(items){
			chrome.tabs.create({ url: items.bkurl });
		});
	});

});