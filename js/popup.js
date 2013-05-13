/*
*	author: Anthony Lau
*	email: anthony-wh.lau@atos.net
*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40637862-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var NOTIFICATION_URL = "https://zen.myatos.net/notification/get?offset=0"
var NOTIF_READ_URL = "https://zen.myatos.net/notification/read";

function requestNotifications(){
	console.log("requestNotifications()");
	$.get(NOTIFICATION_URL, function(data){
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
					   chrome.tabs.create({ url: feed.rel });
					};
				})(feed));
				
				var avatarContainer = $('<a class="pull-left" href="#"/>');
				avatarContainer.appendTo(li);
				var avatar = $('<img/>');
				avatar.appendTo(avatarContainer);
				avatar.attr('src',feed.picture);
				avatar.attr('class', 'media-object');
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
			var errorMsg = $('<div style="width: 250px"/>');
			errorMsg.html('Error while loading notifications. Are you logged in?');
			errorMsg.appendTo('body');
		}
	})
	.fail(function(){console.log("failed to fetch notification data")});;
}
/*
	"feeds": [{
		"id": 2280203,
		"picture": "https:\/\/zen.myatos.net\/cache\/zen\/user\/avatar\/8b384206042fc6e2a17d3b12dabb5d18_avatar_small.jpg",
		"unread": false,
		"content": "\n\tVickie Tam<\/span> alerted you on post<\/span> \n\t\t\t\t\t100 HK users joined BlueKiwi! <\/span>\n\n\t
\"100 HK users joined BlueKiwi!\"<\/span>\n\n 
\n \n \t<\/span>\n \t1 hour ago <\/span>\n<\/span>",
		"objectId": "723753",
		"private": false,
		"rel": "https:\/\/zen.myatos.net\/user\/in\/Vickie_Tam\/post?id=723753",
		"deleteToken": "bbf1c55eab2acffa273c2af2d2ba4ff824c0dea4|17173"
	},
*/

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