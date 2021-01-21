// const data_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/sample_data.csv';
const dim__lawsuits_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/dim__lawsuits.csv'
const fct__lawsuits_address = 'https://raw.githubusercontent.com/bora-uyumazturk/election-lawsuits/main/data/fct__lawsuits.csv'

const width = 800;
const height = 500;
const padding = 20;
const r = 5;

function main() {
  // begin downloading data
  let promises = [
    d3.csv(dim__lawsuits_address),
    d3.csv(fct__lawsuits_address)
  ]

  Promise.all(promises).then(function(allData) {

    let timelines = new TimelineCollection(
      "#chart-area",
      allData[0],
      allData[1],
      height,
      width,
      padding,
      r
    )
  });
}

main();
