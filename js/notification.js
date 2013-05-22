document.addEventListener('DOMContentLoaded', function(){
	$('#notif-cnt').html(window.location.hash.substr(1));
	$('#snooze-30m').click(function(){
		window.close()
	});
	$('#snooze-1h').click(function(){
		window.close()
	});
});
