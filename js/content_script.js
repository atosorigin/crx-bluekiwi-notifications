var origTitle = document.querySelector('title').innerHTML;

(function(){
  var title = origTitle;
  
  var spaceTitle = $('h2 > .max70.ellipsis');
  var navItems = document.querySelectorAll('.page_footer > .railway > li');

  if(spaceTitle.text()){
    var nav1 = spaceTitle.text().replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' ').trim();
    //var nav2 = spaceTitle.parent().contents().filter(function(){return this.nodeType == 3;}).last().text().replace(/(\r\n|\n|\r|\/)/gm,"").replace(/\s+/gm,' ').trim();
    //not work if the sub title has link
    //title = nav1 + ' » ' + nav2;
    title = nav1;
  }else if (navItems){
    var nav1 = navItems[1]?navItems[1].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
    var nav2 = navItems[2]?navItems[2].textContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/gm,' '):'';
    title = (nav1 + nav2).trim();
  }
  
  document.querySelector('title').innerHTML = title;
})();

