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
			//console.log("Updated from " + details.previousVersion + " to " + thisVersion +" + !");
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
    if(!notifDisabled){
      checkUpdate();
    }else{
      console.log('notification is disabled');
    }
  });

	/*
	//for testing
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
      var evtNotifReqSrc = 'notif-req';
			var notifurl = bkurl + NOTIF_URL;
			console.log('check notification with ' + notifurl);
			$.get(notifurl, function(data){
				if(typeof data.data === 'undefined'){
          _gaq.push(['_trackEvent', evtNotifReqSrc , 'fail' , 'invalid resp data']);
					chrome.browserAction.setBadgeText( { text: "ERR"} );
          if(loginNotification == null){
            loginNotification = webkitNotifications.createNotification(
                    'img/icon128.png',
                    'Please login blueKiwi in order to receive notification.',
                    ''
                  );
            loginNotification.onclick = function(){
									_gaq.push(['_trackEvent', evtNotifSrc, 'clicked']);
									chrome.tabs.create({ url: bkurl });
									loginNotification.cancel();
								};
            loginNotification.show();
          }
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
								
								notification = webkitNotifications.createNotification(
								  'img/icon128.png',  // icon url - can be relative
								  'You have ' + val.notification + ' notification' + (val.notification > 1?'s':'')+ '!',  // notification title
								  ''  // notification body text
								);
								
								notification.onclose = function(){
									//_gaq.push(['_trackEvent', evtNotifSrc, 'closed']);
									notification = null;							
								};
								notification.onclick = function(){
									_gaq.push(['_trackEvent', evtNotifSrc, 'clicked']);
									chrome.tabs.create({ url: bkurl });
									clearNotification();
								};
								notification.show();
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
        _gaq.push(['_trackEvent', evtNotifReqSrc , 'fail' , textStatus]);
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
	});
}

function enableNotification(b){
  console.log('enableNotification ' + b);
  if(b){
    checkUpdate();
  }else{
    clearTimeout(checkUpdateTimeoutId);
  }
}

init();
