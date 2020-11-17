// scroller variables
// following https://pudding.cool/process/introducing-scrollama/
var main = d3.select('main');
var scrolly = main.select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');

var scroller = scrollama();

function handleResize() {
  d3.select("#intro")
    .select("div")
    .style("height", 1.1*window.innerHeight + "px");
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.50);
  var stepW = Math.floor(window.innerWidth * 0.25);
  step.style("height", stepH + "px");
  step.style("width", stepW + "px");

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}
