const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';

const width = 800;
const height = 500;
const padding = 20;
const r = 5;

function main() {
  // begin downloading data
  let promises = [
    d3.csv(data_address)
  ]

  Promise.all(promises).then(function(allData) {

    let timelines = new TimelineCollection(
      "#chart-area",
      allData[0],
      height,
      width,
      padding,
      r
    )

  });
}

main();
