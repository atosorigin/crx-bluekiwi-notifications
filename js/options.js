function save_options() {
  var bkurl = document.getElementById("url").value;
  chrome.storage.sync.set({'bkurl': bkurl},function(){
	console.log('bkurl saved with ' + bkurl);
	var status = document.getElementById("status");
	status.innerHTML = "<div class='alert alert-success'><strong>Confirmed!</strong> URL Saved!</div>";
	setTimeout(function() {
		status.innerHTML = "";
	}, 2000);
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