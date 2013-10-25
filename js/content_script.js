(function(){
  console.log('content_script start');
  var navItems = document.querySelectorAll('.page_footer > .railway > li');
  var nav1 = navItems[1].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ');
  var nav2 = navItems[2].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ');
  document.querySelector('title').innerHTML = (nav1 + nav2).trim();
  console.log('content_script end');
})();


//$('.page_footer > .railway > li').slice(1,3).text().replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ').trim();
