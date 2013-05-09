_gaq.push(['_trackPageview']);

function requestNotifications(){
	console.log("requestNotifications()");
	$.get(NOTIF_FEED_URL, function(data){
		try{
			var feeds = $.parseJSON(data).feeds;
			
			var ul = $('<ul style="list-style: none" class="notif-ul"/>');
			
			if(feeds.length == 0){
				var li = $('<li/>');
				li.html('No notifications');
				li.appendTo(ul);
			}
			
			for(var i in feeds){
				var feed = feeds[i];
				var li = $('<li style="cursor: pointer;" class="notif-li"/>');
				li.appendTo(ul);
				li.click((function(feed) {
					return function() {
					   chrome.tabs.create({ url: feed.rel });
					};
				})(feed));
				
				var avatarContainer = $('<div class="avatar"/>');
				avatarContainer.appendTo(li);
				var avatar = $('<img/>');
				avatar.appendTo(avatarContainer);
				avatar.attr('src',feed.picture);
				
				var content = $('<div class="notif-content"/>');
				content.appendTo(li);
				content.html(feed.content);
			}
			
			$('#loading').hide();
			ul.appendTo('body');
			
			chrome.browserAction.setBadgeText( { text: ''} );
			$.get(NOTIF_READ_URL,function(){
				console.log('mark notification as read');
			});
		}catch(err){
			console.log('Error while loading or creating list of notifications, error message: ' + err.message);
			$('#loading').hide();
			var errorMsg = $('<div style="width: 250px"/>');
			errorMsg.html('Error while loading notifications. Are you logged in?');
			errorMsg.appendTo('body');
		}
	})
	.fail(function(){console.log("failed to fetch notification data")});;
}

document.addEventListener('DOMContentLoaded', function () {
	console.log("DOMContentLoaded");
	requestNotifications();
	/*
	//for testing
	var notification = webkitNotifications.createNotification(
						  'bluekiwi.ico',  // icon url - can be relative
						  'test',  // notification title
						  'test'  // notification body text
						);
	notification.show();
	*/
	chrome.extension.getViews({type:"notification"}).forEach(function(win) {
	  //FIXME cannot fetch any notification
		console.log('notification ' + win);
	});
	
	chrome.extension.getBackgroundPage().clearNotification();
});