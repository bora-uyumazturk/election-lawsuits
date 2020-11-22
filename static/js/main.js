const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';

const width = 1000;
const height = 500;
const margin_left = 150;
const margin_top = 40;

let graph;
let dateLabel;

let stepFunctions = [];
// let interval;

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

// function startAnimation(data) {
//   var i = 3;
//   var dateStr;
//   var curDate;
//
//   interval = setInterval(() => {
//     // get date string
//     dateStr = `${i}`;
//     if (i < 10) {
//       dateStr = `0${i}`;
//     }
//     curDate = `2020-11-${dateStr}`;
//
//     // update visuals
//     dateLabel.update(curDate);
//     graph.update(getCaseStates(data, curDate));
//
//     i++;
//     if (i > 17) {
//       clearInterval(interval);
//     }
//   }, 1000);
// }

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
      graph.update(getEachCaseStart(lawsuitData), 2000, ['action']);
    };

    // break out by state
    stepFunctions[1] = function() {
      states = getDistinctStates(lawsuitData);
      graph.initStateScale(states);
      graph.initStateLabels();
      graph.update(getEachCaseStart(lawsuitData), 2000, ['state', 'action'], true, true);
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
      graph.update(
        getEachCaseEnd(
          _.filter(lawsuitData, (x) => {
            return inList(x.case_id, _.map(cases, (x) => x.case_id));
          })
        ), 2000, ['state', 'action'], true, true
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
        ), 2000, ['state', 'action'], true, true
      )
    }

    // unhighlight all
    stepFunctions[6] = function () {
      graph.highlight([]);
    }

    // stepFunctions[2] = function() {
    //   graph.updateLabels([
    //     {category: 'Complaint Filed', label: 'Complaints Filed'},
    //     {category: 'Denied', label: 'Denied'},
    //     {category: 'Appealed', label: 'Appealed'},
    //     {category: 'Won', label: 'Won'}
    //   ]);
    //   graph.update(getEachCaseEnd(lawsuitData), 2000, ['action', 'state'],
    //     true, true);
    // }
    //
    // stepFunctions[3] = function() {
    //   var caseIds = [
    //     {case_id: '13'},
    //     {case_id: '15'},
    //     {case_id: '12'}
    //   ];
    //
    //   graph.pulse(caseIds);
    // }
    //
    // stepFunctions[4] = function() {
    //   var caseIds = [
    //     {case_id: '13'},
    //     {case_id: '15'},
    //     {case_id: '12'}
    //   ];
    //
    //   graph.unpulse(caseIds);
    // }
    //
    // stepFunctions[5] = function() {
    //   var startDate = '2020-11-03';
    //   var endDate = '2020-11-10';
    //   var cases = getLawsuitsFiledBetween(
    //     lawsuitData,
    //     startDate,
    //     endDate);
    //   console.log(cases);
    //   graph.highlight(cases);
    // }

    initScroller();
  });
}

main();
