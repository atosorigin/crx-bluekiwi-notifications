function save_options() {
  var bkurl = document.getElementById("url").value;
  
  bkurl = bkurl.replace(/\/$/,'');//remove last splash if exists
  console.log('bkurl ' + bkurl);
  
  var notifurl = bkurl + NOTIF_URL;
  var status = $("#status");
  var errorhtml = "<div class='alert alert-error'><strong>Invalid URL!</strong></div>";
  status.html("<div class='alert alert-info'><img src='img/ajax-loader.gif'/><strong>Validating URL...</strong></div>");
  $.get(notifurl, function(data){
		if(typeof data.data === 'undefined'){
			$("#status").html(errorhtml);
		}else{
			chrome.storage.sync.set({'bkurl': bkurl},function(){
				console.log('bkurl saved with ' + bkurl);
				status.html("<div class='alert alert-success'><strong>Confirmed!</strong> URL Saved!</div>");
				setTimeout(function() {
					status.html('');
				}, 2000);
			});
		}
  }).fail(function(){
		status.html(errorhtml);
  });
}

function restore_options() {
  chrome.storage.sync.get('bkurl', function(items){
	var bkurl = items.bkurl;
	console.log('bkurl got ' + bkurl);
	if (!bkurl) {
		return;
	}
	document.getElementById("url").value = bkurl;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);