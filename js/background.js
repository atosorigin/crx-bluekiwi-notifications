var notification = null;

function init(){
	chrome.runtime.onInstalled.addListener(function(details){
		var thisVersion = chrome.runtime.getManifest().version;
		if(details.reason == "install"){
			_gaq.push(['_trackEvent', 'ext', 'install', thisVersion]);
		}else if(details.reason == "update"){
			_gaq.push(['_trackEvent', 'ext', 'update', thisVersion]);
			//console.log("Updated from " + details.previousVersion + " to " + thisVersion +" + !");
		}
		
	});
	var t = setInterval(checkUpdate, FETCH_INTERVAL);

	//TODO use alarms instead of setInterval as suggested by Chrome extension guidline
	/*
	chrome.alarms.create(ALARM_NAME, {
		periodInMinutes: 1
	});
	*/
	checkUpdate();

	/*
	//for testing
	notification = webkitNotifications.createNotification(
						  '',  // icon url - can be relative
						  'test',  // notification title
						  'test'  // notification body text
						);
	notification.show();
	console.log('desktop notif');
	chrome.extension.getViews({type:"notification"}).forEach(function(win) {
	  //FIXME cannot fetch any notification
		console.log('notification ' + win);
	});
	*/
}
var evtNotifSrc = 'bg-notif';

function clearNotification(){
	if(notification != null){
		notification.cancel();
		notification = null;
		//_gaq.push(['_trackEvent', evtNotifSrc, 'canceled']);
	}
}

function checkUpdate(){
	console.log('checking update');
	clearNotification();
	chrome.storage.sync.get('bkurl', function(items){
		var bkurl = items.bkurl;
		var notifurl = bkurl + NOTIF_URL;
		console.log('check notification with ' + notifurl);
		$.get(notifurl, function(data){
			if(typeof data.data === 'undefined'){
				chrome.browserAction.setBadgeText( { text: "ERR"} );
			}else{
				var binding = data.data.binding;
				$.each( binding, function(idx, val){
					if(idx == "/instance"){
						console.log("# of notification: " + val.notification);
						var badgeText = "";
						if(val.notification > 0){
							badgeText = "" + val.notification;
							
							//chrome.extension.getViews({type:"notification"}).forEach(function(win) {
							//});
							
							notification = webkitNotifications.createNotification(
							  'img/icon128.png',  // icon url - can be relative
							  'You have ' + val.notification + ' notification' + (val.notification > 1?'s':'')+ '!',  // notification title
							  ''  // notification body text
							);
							_gaq.push(['_trackEvent', evtNotifSrc, 'created']);
							notification.onclose = function(){
								//_gaq.push(['_trackEvent', evtNotifSrc, 'closed']);
								notification = null;							
							};
							notification.onclick = function(){
								_gaq.push(['_trackEvent', evtNotifSrc, 'clicked']);
								chrome.tabs.create({ url: notifurl });
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
		.fail(function(){console.log("failed to fetch notification data")});
	});
}

init();
