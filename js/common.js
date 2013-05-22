var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40637862-1']);
_gaq.push(['_trackPageview']);

var DEBUG_MODE = function(){
	var extid = chrome.i18n.getMessage('@@extension_id');
	var prodextid = 'nmokaddnjebadokcmjfbinphpfkenghp';
	if(prodextid === extid){
		return false;
	}else{
		return true;
	}
}();

if(!DEBUG_MODE){
	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
}

var NOTIF_URL = "/notification/updater";
var NOTIF_FEED_URL = "/notification/get";
var NOTIF_READ_URL = "/notification/read";
var NEWS_READ_URL = "/syndication/home?filterType=all";

var FETCH_INTERVAL = 2 * 60 * 1000;
var ALARM_NAME = "notification_checker";


