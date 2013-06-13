$.ajaxSetup({timeout:30 * 1000}); 

var _bkurl = null;

function validateURL(url){
	return /^(https?):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function save_options() {
  var evtOptionSrc = 'options';
  $('#url').prop('disabled',true);
  $('#save').prop('disabled',true);

  var bkurl = document.getElementById("url").value;
  
  bkurl = bkurl.replace(/\/+$/,'');//remove last splash if exists
  console.log('bkurl ' + bkurl);
  
  var notifurl = bkurl + NOTIF_URL;
  var status = $("#status");
  var errorhtml = "<div class='alert alert-warning enter-url'>Error while validating blueKiwi URL.  Are you <a href='" + bkurl + "' target='_blank'>logged in</a>?  Please make sure the checkbox to stay logged in on blueKiwi is ticked.</div>";
  status.html("<div class='alert alert-info'><img src='img/ajax-loader.gif'/><strong>Validating URL...</strong></div>");
  $.get(notifurl, function(data){
    if(typeof data.data === 'undefined'){
      _gaq.push(['_trackEvent', evtOptionSrc, 'bkurl' , 'invalid']);
      $("#status").html(errorhtml);
    }else{
      chrome.storage.sync.set({'bkurl': bkurl},function(){
        _gaq.push(['_trackEvent', evtOptionSrc, 'bkurl' , 'valid']);
        console.log('bkurl saved with ' + bkurl);
        _bkurl = bkurl;
        status.html("<div class='alert alert-success'><strong>Confirmed!</strong> Settings Saved!</div>");
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
    
  var options = {
    'notifFetchInterval': $("#noti-time").val(),
    'notifDisabled': $("#noti-disable").prop('checked')
  };
    
  chrome.storage.sync.set(options, function(){
      console.log('options saved' + JSON.stringify(options));
      chrome.extension.getBackgroundPage().enableNotification(!options.notifDisabled);
  });
}

function restore_options() {
  chrome.storage.sync.get(['bkurl','notifFetchInterval','notifDisabled'], function(items){
	var bkurl = items.bkurl;
	var fetchIntvl = items.notifFetchInterval;
	var notifDisabled = items.notifDisabled;
	console.log('bkurl got ' + bkurl);
	if (bkurl) {
		$("#url").val(bkurl);
    _bkurl = bkurl;
	}
	if(!fetchIntvl){
		fetchIntvl = DEFAULT_FETCH_INTERVAL;
	}

	if(notifDisabled){
		$('#noti-disable').prop('checked',true);
	}else{
		$('#noti-disable').prop('checked',false);
	}
	$("#noti-time").val(fetchIntvl);
  });
}
document.addEventListener('DOMContentLoaded', function(){
	restore_options();
	$('#version').html(chrome.runtime.getManifest().version);
	//$('#save').click(save_options);
	
  $('#form-options').submit(function(event){
			console.log('submit');
			event.preventDefault();
      save_options();
  });

  var url = document.getElementById("url");
  url.addEventListener("input", function() {
      if (!validateURL(url.value)) {
          url.setCustomValidity("Invalid URL format.");
      } else {
          url.setCustomValidity("");
      }
  });
  
  window.onbeforeunload = function(){
    if(!_bkurl){
      return 'The blueKiwi URL needs to be set in order to receive notifications.';
    }
  }
});
