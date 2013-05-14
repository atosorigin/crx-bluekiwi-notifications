function requestNotifications(){
	console.log("requestNotifications()");
	$.get(NOTIF_FEED_URL, function(data){
		try{
			var feeds = $.parseJSON(data).feeds;
			
			var ul = $('<div class="list"/>');
			
			if(feeds.length == 0){
				var li = $('<li/>');
				li.html('No notifications');
				li.appendTo(ul);
			}
			
			for(var i in feeds){
				var feed = feeds[i];
				var li = $('<div class="media"/>');
				li.appendTo(ul);
				li.click((function(feed) {
					return function() {
						_gaq.push(['_trackEvent', 'popup-feed', 'clicked']);
						chrome.tabs.create({ url: feed.rel });
					};
				})(feed));
				
				var avatarContainer = $('<a class="pull-left" href="#"/>');
				avatarContainer.appendTo(li);
				var avatar = $('<img/>');
				avatar.appendTo(avatarContainer);
				avatar.attr('src',feed.picture);
				
				var content = $('<div class="media-body"/>');
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
			var errorMsg = $('<div>');
			errorMsg.html('<div class="loading"><div class="alert alert-error">Error while loading notifications. Are you logged in?<br> Click the home button above to login</div></div>');
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
	
	$('#btnHome').click(function(){
		_gaq.push(['_trackEvent', 'popup-home-btn', 'clicked']);
	});
});
