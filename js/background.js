var notification = null;
var loginNotification = null;
var checkUpdateTimeoutId = null;

function init(){
	chrome.runtime.onInstalled.addListener(function(details){
		var thisVersion = chrome.runtime.getManifest().version;
		if(details.reason == "install"){
			_gaq.push(['_trackEvent', 'ext', 'install', thisVersion]);
		}else if(details.reason == "update"){
			_gaq.push(['_trackEvent', 'ext', 'update', thisVersion]);
			console.log("Updated from " + details.previousVersion + " to " + thisVersion +" + !");
      
      var notif = webkitNotifications.createNotification(
        'img/icon128.png',
        'blueKiwi Notifier is Updated!',
        'Updated from ' + details.previousVersion + ' to ' + thisVersion + '.'
        + '\n' + 'Click here to view the change log.'
			);
      notif.onclick = function(){
        chrome.tabs.create({ url: 'changelog.html' });
        notif.cancel();
      };
      notif.show();
      setTimeout(function(){notif.cancel()},10 * 1000);
		}
		//check if bkurl is set
		chrome.storage.sync.get('bkurl', function(items){
			if(!items.bkurl){
				chrome.tabs.create({ url: 'options.html' });
			}
		});
	});
	//var t = setTimeout(checkUpdate, FETCH_INTERVAL);

	//TODO use alarms instead of setTimeout as suggested by Chrome extension guidline
	/*
	chrome.alarms.create(ALARM_NAME, {
		periodInMinutes: 1
	});
	*/
  
  //setup timeout for ajax request
  $.ajaxSetup({timeout:60 * 1000});
  
  chrome.storage.sync.get(['notifDisabled'], function(items){
    var notifDisabled = items.notifDisabled;
    enableNotification(!notifDisabled);
  });

	/*
	//for testing
  createNotification(1);
	var notification = webkitNotifications.createHTMLNotification(
	  'notification.html#1'  // html url - can be relative
	);
	notification.show();
	chrome.extension.getViews({type:"notification"}).forEach(function(win) {
	  console.log(win);
	});
	});
	*/
}
var evtNotifSrc = 'bg-notif';

function clearNotification(){
	if(notification != null){
		console.log('canceling notification');
		notification.cancel();
		notification = null;
		//_gaq.push(['_trackEvent', evtNotifSrc, 'canceled']);
	}else{
		console.log('notification is null');
	}
}

function checkUpdate(){
	console.log('checking update');
	clearNotification();
	chrome.storage.sync.get('bkurl', function(items){
		var bkurl = items.bkurl;
		if(bkurl){
      checkNotification(bkurl);
		}
	});
}

function checkNotification(bkurl){
  var evtNotifReqSrc = 'notif-req';
  var notifurl = bkurl + NOTIF_URL;
  console.log('check notification with ' + notifurl);
  $.get(notifurl, function(data){
    if(typeof data.data === 'undefined'){
      _gaq.push(['_trackEvent', evtNotifReqSrc , 'fail' , 'invalid resp data']);
      chrome.browserAction.setBadgeText( { text: "ERR"} );
      chrome.storage.sync.get('loginReminderDisabled', function(items){
        var loginReminderDisabled = items.loginReminderDisabled;
        if(!loginReminderDisabled){
          if(loginNotification == null){
          loginNotification = webkitNotifications.createNotification(
                  'img/icon128.png',
                  'Please login blueKiwi in order to receive notifications.',
                  'If you see this notification frequently. Check "Keep me logged in" on login page.'
                );
          loginNotification.onclick = function(){
                _gaq.push(['_trackEvent', evtNotifSrc, 'clicked']);
                chrome.tabs.create({ url: bkurl });
                loginNotification.cancel();
                loginNotification = null;
              };
          loginNotification.show();
          setTimeout(function(){
            if(loginNotification){
              loginNotification.cancel()
              loginNotification = null;
            }
          },30 * 1000);
          }
        }
      });
    }else{
      var binding = data.data.binding;
      $.each( binding, function(idx, val){
        if(idx == "/instance"){
          console.log("# of notification: " + val.notification);
          var badgeText = "";
          if(val.notification > 0){
            badgeText = "" + val.notification;
            
            if(notification == null){
              //_gaq.push(['_trackEvent', evtNotifSrc, 'created']);
            }
            
            createNotification(val.notification, bkurl);
          }else{
            clearNotification();
          }
          chrome.browserAction.setBadgeText( { text: badgeText} );
        }
      });
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    console.log("failed to fetch notification data");
    _gaq.push(['_trackEvent', evtNotifReqSrc , 'fail' , textStatus + '-' + errorThrown]);
  })
  .always(function(){
    //check update
    chrome.storage.sync.get('notifFetchInterval', function(items){
      var fetchIntvl = items.notifFetchInterval;
      if(!fetchIntvl){
        fetchIntvl = DEFAULT_FETCH_INTERVAL;
      }
      console.log('fetchIntvl='+fetchIntvl);
      checkUpdateTimeoutId = setTimeout(checkUpdate, fetchIntvl * 60 * 1000);
    });
  });
}

function createNotification(cnt, bkurl){
  var notif = webkitNotifications.createNotification(
    'img/icon128.png',  // icon url - can be relative
    'You have ' + cnt + ' notification' + (cnt > 1?'s':'')+ '!',  // notification title
    ''  // notification body text
  );
  notification = notif;
  
  var showNotification = function(){
    chrome.storage.sync.get(['notifDisabled'], function(items){
      var notifDisabled = items.notifDisabled;
      if(!notifDisabled){
        console.log('notification=' + notif);
        notif.show();
      }
    });
  };
  
  if(cnt == 1){
    var feedurl = bkurl + NOTIF_FEED_URL;
    console.log('Fetch notification feed from ' + feedurl);
    $.get(feedurl, {'offset': 0}, function(data){
      try{
        var feeds = $.parseJSON(data).feeds;
        if(feeds.length >= 1){
          notif.onclick = function(){
            _gaq.push(['_trackEvent', evtNotifSrc, 'clicked', 'itemurl']);
            var feed = feeds[0];
            var itemurl = feed.rel;
						if(itemurl.indexOf('http') != 0){
							itemurl = bkurl + itemurl;
						}
						chrome.tabs.create({ url: itemurl })
            clearNotification();
            $.get(bkurl + NOTIF_READ_URL,function(){
              console.log('mark notification as read');
            });
          };
        }
        showNotification();
      }catch(err){
        _gaq.push(['_trackEvent', evtNotifSrc, 'error', err]);
      }
    });
  }else{
    notif.onclick = function(){
      _gaq.push(['_trackEvent', evtNotifSrc, 'clicked', 'bkurl']);
      chrome.tabs.create({ url: bkurl });
      clearNotification();
    };
    showNotification();
  }
}

function enableNotification(b){
  console.log('enableNotification ' + b);
  var icon = "img/icon48.png";
  clearTimeout(checkUpdateTimeoutId);
  if(b){
    checkUpdate();
  }else{
    icon = "img/icon48-gray.png";
  }
  chrome.browserAction.setIcon({
      path  : icon
    }, function(){
    console.log('browser-action icon updated');
  });
}

init();
