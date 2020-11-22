const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';

const width = 1000;
const height = 500;
const margin_left = 150;
const margin_top = 40;

let graph;
let dateLabel;

let stepFunctions = [];

function getCaseStates(data, date) {
  // get last sate of all cases before given date
  return _.chain(data)
   .filter((x) => {return x.date <= date;})
   .groupBy('case_id')
   .map((x) => {return x[x.length - 1];})
   .flatten()
   .value()
}

function getEachCaseStart(data) {
  // get first instance of each case
  return _.chain(data)
    .orderBy(['date'], ['asc'])
    .groupBy('case_id')
    .map((x) => {return x[0]})
    .flatten()
    .value();
}

function getEachCaseEnd(data) {
  return _.chain(data)
    .orderBy(['date'], ['desc'])
    .groupBy('case_id')
    .map((x) => {return x[0]})
    .flatten()
    .value();
}

function getDistinctStates(data) {
  return _.chain(data)
    .orderBy(['state'], ['asc'])
    .map((x) => {return x.state;})
    .uniq()
    .value()
}

function getLawsuitsFiledBetween(data, startDate, endDate) {
  return _.chain(data)
    .filter((x) => {
      return ((x.action == 'Complaint Filed') &&
        (x.date >= startDate) &&
        (x.date < endDate));
    })
    .orderBy(['date'], ['asc'])
    .value();
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

    //dateLabel = new DateLabel('#date-label',
    // margin_left-10,
    //   10);
    graph = new StateGrid('#chart-area',
      width, height,
      margin_left, margin_top);

    // show all filed lawsuits
    stepFunctions[0] = function() {
      graph.updateLabels([
        {category: 'Complaint Filed', label: 'Complaints Filed'},
      ]);
      graph.update(
        _.orderBy(getEachCaseStart(lawsuitData), ['state', 'date'], ['asc']),
        2000, ['action'], false, 'row');
    };

    // break out by state
    stepFunctions[1] = function() {
      states = getDistinctStates(lawsuitData);
      graph.initStateScale(states);
      graph.initStateLabels();
      graph.highlight([]);
      graph.update(getEachCaseStart(lawsuitData), 2000, ['state', 'action'], true, 'state');
    }

    // highlight lawsuits filed in the first week
    stepFunctions[2] = function() {
      var cases = getLawsuitsFiledBetween(
        lawsuitData,
        '2020-11-03',
        '2020-11-10'
      );
      graph.highlight(cases);
    }

    // show outcomes
    stepFunctions[3] = function() {
      var cases = getLawsuitsFiledBetween(
        lawsuitData,
        '2020-11-03',
        '2020-11-10'
      );
      graph.updateLabels([
        {category: 'Complaint Filed', label: 'Complaints Filed'},
        {category: 'Denied', label: 'Denied'},
        {category: 'Appealed', label: 'Appealed'},
        {category: 'Won', label: 'Won'}
      ]);
      graph.highlight(cases);
      graph.update(
        getEachCaseEnd(
          _.filter(lawsuitData, (x) => {
            return inList(x.case_id, _.map(cases, (x) => x.case_id));
          })
        ), 2000, ['state', 'action'], true, ''
      )
    }

    // highlight lawsuits from the second week
    stepFunctions[4] = function() {
      var cases = getLawsuitsFiledBetween(
        lawsuitData,
        '2020-11-10',
        '2020-11-17'
      );
      graph.highlight(cases);
    }

    // show outcomes
    stepFunctions[5] = function() {
      var cases = getLawsuitsFiledBetween(
        lawsuitData,
        '2020-11-10',
        '2020-11-17'
      );

      graph.update(
        getEachCaseEnd(
          _.filter(lawsuitData, (x) => {
            return inList(x.case_id, _.map(cases, (x) => x.case_id));
          })
        ), 2000, ['state', 'action'], true, ''
      )
    }

    // unhighlight all
    stepFunctions[6] = function () {
      graph.highlight([]);
    }

    initScroller();
  });
}

main();
