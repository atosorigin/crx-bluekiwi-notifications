var notification = null;
var loginNotification = null;
var checkUpdateTimeoutId = null;
var snoozeNotifTimeoutId = null;

var evtNotifSrc = 'bg-notif';

var notifSignleRel;

function init(){
  moment.lang('en');
  
	chrome.runtime.onInstalled.addListener(function(details){
		var thisVersion = chrome.runtime.getManifest().version;
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    console.log('chromeVersion='+chromeVersion);
		if(details.reason == "install"){
			_gaq.push(['_trackEvent', 'ext', 'install', thisVersion + ';' + chromeVersion]);
		}else if(details.reason == "update"){
			_gaq.push(['_trackEvent', 'ext', 'update', thisVersion + ';' + chromeVersion]);
			console.log("Updated from " + details.previousVersion + " to " + thisVersion + " !");
      
      var updateNotificationTitle = 'blueKiwi Notifier has been Updated!';
      var updateNotificationMsg = 'Updated from ' + details.previousVersion + ' to ' + thisVersion + '.';
      if(chromeVersion >= 28){
        var opt = {
          type: "basic",
          title: updateNotificationTitle,
          message: updateNotificationMsg,
          iconUrl: "img/icon128.png"
        };
        var notifId = 'ext_updated';
        chrome.notifications.create(notifId, opt, function(id){console.log('notification id='+id);});
        chrome.notifications.onClicked.addListener(function(notificationId){
          if(notificationId == notifId){
            chrome.tabs.create({ url: 'changelog.html' });
            /*
            chrome.notifications.clear(notifId, function(wasCleared){
              console.log('wasCleared=' + wasCleared + ';' + notificationId);
            });
            */
          }
        });
      }else{
        var notif = webkitNotifications.createNotification(
          'img/icon128.png',
          updateNotificationTitle,
          updateNotificationMsg
          + '\n' + 'Click here to view the change log.'
        );
          notif.onclick = function(){
          chrome.tabs.create({ url: 'changelog.html' });
          notif.cancel();
        };
        notif.show();
        setTimeout(function(){notif.cancel()},10 * 1000);
      }
      
      
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
  chrome.notifications.onClicked.addListener(function(notificationId){
    if(notificationId === NOTIF_ID){
      chrome.notifications.clear(notificationId, function(wasCleared){
        console.log('notificationId=%s, wasCleared=%s', notificationId, wasCleared);
        chrome.storage.sync.get('bkurl', function(items){
          if(items.bkurl){
            _gaq.push(['_trackEvent', evtNotifSrc, 'open bk site']);
            chrome.tabs.create({ url: items.bkurl });
          }
        });
      });
    }else if(notificationId === NOTIF_SINGLE_ID){
      chrome.notifications.clear(notificationId, function(wasCleared){
        console.log('notificationId=%s, wasCleared=%s', notificationId, wasCleared);
        if(notifSignleRel){
          chrome.storage.sync.get('bkurl', function(items){
            if(items.bkurl){
              chrome.tabs.create({ url: items.bkurl + notifSignleRel });
              notifSignleRel = null;
            }
          });
        }
      });
    }else if(notificationId === NOTIF_LOGIN_ID){
      chrome.notifications.clear(notificationId, function(wasCleared){
        console.log('notificationId=%s, wasCleared=%s', notificationId, wasCleared);
        chrome.storage.sync.get('bkurl', function(items){
          if(items.bkurl){
            chrome.tabs.create({ url: items.bkurl });
          }
        });
      });
    }
  });
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    if(notificationId === NOTIF_ID || notificationId === NOTIF_SINGLE_ID){
      console.log("onButtonClicked, " + notificationId + ";" + buttonIndex);
      if(buttonIndex == 0){
        console.log("snooze notification button clicked");
        _gaq.push(['_trackEvent', evtNotifSrc, 'snooze-notif']);
        enableNotification(false);
        snoozeNotifTimeoutId = setTimeout(function(){enableNotification(true);}, 60 * 60 * 1000);
        clearNotification();
      }
    }else if(notificationId === NOTIF_LOGIN_ID){
      chrome.storage.sync.set({loginReminderDisabled: true}, 
        function(){
          console.log('loginReminderDisabled is set to true');
        });
    }
  });
}

function clearNotification(){
	if(notification != null){
		console.log('canceling notification');
		notification.cancel();
		notification = null;
	}else{
		console.log('notification is null');
	}
  var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  console.log('chromeVersion='+chromeVersion);
  if(chromeVersion >= 28){
    chrome.notifications.clear(NOTIF_ID, function(wasCleared){
      console.log('notificationId=%s, wasCleared=%s', NOTIF_ID, wasCleared);
    });
    chrome.notifications.clear(NOTIF_SINGLE_ID, function(wasCleared){
      console.log('notificationId=%s, wasCleared=%s', NOTIF_ID, wasCleared);
    });
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
          /*
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
          */
          var opt = {
            type: "basic",
            title: 'Please login blueKiwi in order to receive notifications.',
            message: 'If you see this notification frequently. Check "Keep me logged in" on login page.',
            iconUrl: "img/icon128.png",
            buttons: [
              {title: "Disable Login Reminder"}
            ]
          };
          chrome.notifications.create(NOTIF_LOGIN_ID, opt, function(id){console.log('notification id='+id);});
          }
        }
      });
    }else{
      _gaq.push(['_trackEvent', evtNotifReqSrc, 'success']);
      /*
      //old API
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
      */
      var notificationData = data.data;
      if(notificationData.json){
        var count = notificationData.json.count;
        console.log("# of notification: " + count);
        var badgeText = "";
        if(count > 0){
          badgeText = "" + count;
          //createNotification(count, bkurl);
          createNotificationWithHeadline(count, bkurl);
        }else{
          clearNotification();
        }
        chrome.browserAction.setBadgeText( { text: badgeText} );
      }
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

function createNotificationWithHeadline(count, bkurl){
  var feedurl = bkurl + NOTIF_FEED_URL;
	console.log('Fetch notification feed from ' + feedurl);
	$.get(feedurl, function(data){
			var feeds = $.parseJSON(data).feeds;
      
      var items = [];
      for (var i = 0; i < feeds.length; i++) {
				var feed = feeds[i];
        if(!feed.unread) continue;
				items.push({title: $(feed.content).text()
          .replace(/\s+/gm,' ').trim() + '\n'
            + moment.unix(feed.date).fromNow()
          , message: ''});
			}
      
      console.log('create notification with headline');
      if(count === 1 && items.length === 1){
        var opt = {
          type: 'basic',
          title: 'blueKiwi Notification',
          message: items[0].title,
          iconUrl: bkurl + feeds[0].avatar,
          buttons: [
            {title: "Snooze notification for an hour"}
          ]
        };
        notifSignleRel = feeds[0].rel;
        chrome.notifications.create(NOTIF_SINGLE_ID, opt, function(id){console.log('notification id='+id);});
      }else{
        var opt = {
          type: 'list',
          title: 'You have ' + count + ' notification' + (count > 1?'s':'')+ '!',
          message: '',
          iconUrl: "img/icon128.png",
          items: items,
          buttons: [
            {title: "Snooze notification for an hour"}
          ]
        };
        chrome.notifications.create(NOTIF_ID, opt, function(id){console.log('notification id='+id);});
      }
  },'text');
}

function createNotification(cnt, bkurl){
  var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  console.log('chromeVersion='+chromeVersion);
  if(chromeVersion >= 28){
    var opt = {
      type: "basic",
      title: 'You have ' + cnt + ' notification' + (cnt > 1?'s':'')+ '!',
      message: '',
      iconUrl: "img/icon128.png",
      buttons: [
        {title: "Snooze notification for an hour"}
      ]
    };
    chrome.notifications.create(NOTIF_ID, opt, function(id){console.log('notification id='+id);});
  }else{
    createWebkitNotification(cnt, bkurl);
  }
}

function createWebkitNotification(cnt, bkurl){
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
  clearTimeout(snoozeNotifTimeoutId);
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
