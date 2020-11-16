const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';

const width = 1000;
const height = 500;
const margin_left = 50;
const margin_top = 80;

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

function main() {
  // begin downloading data
  let promises = [
    d3.csv(data_address)
  ]

  Promise.all(promises).then(function(allData) {

    let lawsuitData = allData[0];

    let dateLabel = new DateLabel('#date-label',
      margin_left-10,
      10);
    let graph = new StateGrid('#chart-area',
      width, height,
      margin_left, margin_top);

    var i = 3;
    var dateStr;
    var curDate;

    const interval = setInterval(() => {
      // get date string
      dateStr = `${i}`;
      if (i < 10) {
        dateStr = `0${i}`;
      }
      curDate = `2020-11-${dateStr}`;

      // update visuals
      dateLabel.update(curDate);
      graph.update(getCaseStates(lawsuitData, curDate));

      i++;
      if (i > 17) {
        clearInterval(interval);
      }
    }, 1000);
  })
}

main();
