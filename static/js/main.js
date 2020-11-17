const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';

const width = 700;
const height = 500;
const margin_left = 50;
const margin_top = 80;

let graph;
let dateLabel;

let stepFunctions = [];
let interval;

function getCaseStates(data, date) {
  // get last sate of all cases before given date
  return _.chain(data)
   .filter((x) => {return x.date <= date;})
   .groupBy('case_id')
   .map((x) => {return x[x.length - 1];})
   .flatten()
   .orderBy(['date'], ['desc'])
   .value()
}

function startAnimation(data) {
  var i = 3;
  var dateStr;
  var curDate;

  interval = setInterval(() => {
    // get date string
    dateStr = `${i}`;
    if (i < 10) {
      dateStr = `0${i}`;
    }
    curDate = `2020-11-${dateStr}`;

    // update visuals
    dateLabel.update(curDate);
    graph.update(getCaseStates(data, curDate));

    i++;
    if (i > 17) {
      clearInterval(interval);
    }
  }, 1000);
}

function handleStepEnter(response) {
  console.log(response);
  // response = { element, direction, index }

  step.classed('is-active', function(d, i) {
    return i === response.index;
  });

  if (response.index < stepFunctions.length) {
    stepFunctions[response.index]();
  }
}

function initScroller() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.75,
      debug: false
    })
    .onStepEnter(handleStepEnter);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

function main() {
  // begin downloading data
  let promises = [
    d3.csv(data_address)
  ]

  Promise.all(promises).then(function(allData) {

    let lawsuitData = allData[0];

    dateLabel = new DateLabel('#date-label',
      margin_left-10,
      10);
    graph = new StateGrid('#chart-area',
      width, height,
      margin_left, margin_top);

    stepFunctions[0] = function() {
      clearInterval(interval);
      startAnimation(lawsuitData);
    }

    initScroller();
  });
}

main();
