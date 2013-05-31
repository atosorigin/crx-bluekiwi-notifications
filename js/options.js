$.ajaxSetup({timeout:10 * 1000}); 

function save_options() {
  var evtOptionSrc = 'options';
  $('#url').prop('disabled',true);
  $('#save').prop('disabled',true);

  var bkurl = document.getElementById("url").value;
  
  bkurl = bkurl.replace(/\/+$/,'');//remove last splash if exists
  console.log('bkurl ' + bkurl);
  
  var notifurl = bkurl + NOTIF_URL;
  var status = $("#status");
  var errorhtml = "<div class='alert alert-warning enter-url'>Error while validating blueKiwi URL.  Are you <a href='" + bkurl + "' target='_blank'>logged in</a>?</div>";
  status.html("<div class='alert alert-info'><img src='img/ajax-loader.gif'/><strong>Validating URL...</strong></div>");
  $.get(notifurl, function(data){
		if(typeof data.data === 'undefined'){
			_gaq.push(['_trackEvent', evtOptionSrc, 'bkurl' , 'invalid']);
			$("#status").html(errorhtml);
		}else{
			chrome.storage.sync.set({'bkurl': bkurl},function(){
				_gaq.push(['_trackEvent', evtOptionSrc, 'bkurl' , 'valid']);
				console.log('bkurl saved with ' + bkurl);
				status.html("<div class='alert alert-success'><strong>Confirmed!</strong> URL Saved!</div>");
				setTimeout(function() {
					status.html('');
				}, 2000);
			});
		}
		$('#url').prop('disabled',false);
		$('#save').prop('disabled',false);
  }).fail(function(jqXHR, textStatus, errorThrown){
		status.html(errorhtml);
		$('#url').prop('disabled',false);
		$('#save').prop('disabled',false);
		console.error('unable to get notifiation data from %s. Error Message: %s', bkurl, textStatus);
		_gaq.push(['_trackEvent', evtOptionSrc, 'bkurl' , 'error-' + textStatus]);
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
document.addEventListener('DOMContentLoaded', function(){
	restore_options();
	$('#version').html(chrome.runtime.getManifest().version);
	document.querySelector('#save').addEventListener('click', save_options);
});
