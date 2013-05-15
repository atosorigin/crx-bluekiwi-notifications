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
			var errorMsg = document.getElementById("status");
			errorMsg.innerHTML = "<div class='alert alert-warning'>Error while loading notifications.  Are you <a href='" + BASE_URL + "' target='_blank'>logged in</a>?</div>";
		}
	})
	.fail(function(){
		console.log("failed to fetch notification data")
		$('#loading').hide();
		var errorMsg = document.getElementById("status");
		errorMsg.innerHTML = "<div class='alert'>You need to enter a BlueKiwi URL in the <a href='options.html'>Options</a> page before you can begin</div>";
	});;
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