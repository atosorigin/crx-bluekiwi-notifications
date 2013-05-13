var notification = null;

function init(){
	chrome.browserAction.onClicked.addListener(function(activeTab)
	{
		chrome.tabs.create({ url: BASE_URL });
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

function clearNotification(){
	if(notification != null){
		notification.cancel();
		notification = null;
	}
}

function checkUpdate(){
	console.log('checking update');
	clearNotification();
	$.get(NOTIF_URL, function(data){
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
						  'bluekiwi.ico',  // icon url - can be relative
						  'You have ' + val.notification + ' notification' + (val.notification > 1?'s':'')+ '!',  // notification title
						  ''  // notification body text
						);
						notification.onclose = function(){
							notification = null;
						};
						notification.onclick = function(){
							chrome.tabs.create({ url: BASE_URL });
							clearNotification()
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
}

init();
