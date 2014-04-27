var ga = function(){};

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
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-40637862-1', 'bk-notif.com');
  ga('send', 'pageview');
}

var NOTIF_URL = "/notification/updater";
var NOTIF_FEED_URL = "/notification/get";
var NOTIF_READ_URL = "/notification/read";
var NEWS_READ_URL = "/syndication/home?filterType=all";
var SETTINGS_SPACES_URL = "/spaces?locationRole=-5&hideOunits=1";

var DEFAULT_FETCH_INTERVAL = 5; //in minutes
var ALARM_NAME = "notification_checker";

var NOTIF_ID = 'bknotif';

