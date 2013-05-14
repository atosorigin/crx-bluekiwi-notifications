function save_options() {
  var bkurl = document.getElementById("url").value;
  localStorage["bluekiwi_url"] = bkurl;

  var status = document.getElementById("status");
  status.innerHTML = "<div class='alert alert-success'><strong>Confirmed!</strong> URL Saved!</div>";
  setTimeout(function() {
    status.innerHTML = "";
  }, 2000);
}

function restore_options() {
  var favorite = localStorage["bluekiwi_url"];
  if (!favorite) {
    return;
  }
   document.getElementById("url").value = favorite;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);