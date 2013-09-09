function requestNotifications(bkurl, offset){
	$('#loading').show();
	var feedurl = bkurl + NOTIF_FEED_URL;
	console.log('Fetch notification feed from ' + feedurl);
	$.get(feedurl, {'offset': offset}, function(data){
		try{
			
			var feeds = $.parseJSON(data).feeds;
			
			var notiflist = $('#notif-list');
			
			if(feeds.length == 0){
				$('<div></div>')
				.html('No notifications')
				.appendTo(notiflist);
			}
			
			for(var i in feeds){
				var feed = feeds[i];
				var media = $('<div class="media"/>');
				media.appendTo(notiflist);
				media.click((function(feed) {
					return function() {
						_gaq.push(['_trackEvent', 'popup-feed', 'clicked']);
						var itemurl = feed.rel;
						if(itemurl.indexOf('http') != 0){
							itemurl = bkurl + itemurl;
						}
						chrome.tabs.create({ url: itemurl });
					};
				})(feed));
				
				var avatarContainer = $('<a class="pull-left" href="#"/>');
				avatarContainer.appendTo(media);
				var avatar = $('<img class="avatar"/>');
				avatar.appendTo(avatarContainer);
				avatar.attr('src',feed.picture);
				
				var content = $('<div class="media-body"/>');
				content.appendTo(media);
				content.html(feed.content);
			}
			
			var btnSeeMore = $('<button class="btn" style="width: 100%;" type="button" id="save">See More</button>');
			btnSeeMore.click(function(){
				$(this).detach();
				requestNotifications(bkurl, offset + feeds.length);
			})
			btnSeeMore.appendTo(notiflist);
			
			$('#loading').hide();
			notiflist.show();
			
			chrome.browserAction.setBadgeText( { text: ''} );
			var readurl = bkurl + NOTIF_READ_URL;
			console.log('mark notifications as read with ' + readurl);
			$.get(bkurl + NOTIF_READ_URL,function(){
				console.log('mark notification as read');
			});
		}catch(err){
			console.log('Error while loading or creating list of notifications, error message: ' + err.message);
			$('#loading').hide();
			var errorMsg = document.getElementById("status");
			errorMsg.innerHTML = "<div class='alert alert-warning enter-url'>Error while loading notifications.  Are you <a href='" + bkurl + "' target='_blank'>logged in</a>?</div>";
		}
	})
	.fail(function(){
		console.log("failed to fetch notification data")
		$('#loading').hide();
		var errorMsg = document.getElementById("status");
		errorMsg.innerHTML = "<div class='alert enter-url'>You need to enter a blueKiwi URL in the <a href='options.html' target='_blank'>Options</a> page before you can begin</div>";
	});;
}

document.addEventListener('DOMContentLoaded', function () {
	console.log("DOMContentLoaded");
	$(document).ready(function(){
    $("[rel=tooltip]").tooltip({ placement: 'bottom'});
});
	chrome.storage.sync.get('bkurl', function(items){
		requestNotifications(items.bkurl, 0);
	});
	$('#btnHome').click(function(){
		chrome.storage.sync.get('bkurl', function(items){
			chrome.tabs.create({ url: items.bkurl });
		});
	});
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
  
  //$(".collapse").collapse();
});