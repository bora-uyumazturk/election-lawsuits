TimelineCollection = function(_parentElement, dim_lawsuits, fct_lawsuits, height, width, padding, r) {
  this.parentElement = _parentElement;
  this.height = height;
  this.width = width;
  this.padding = padding;
  this.r = r;
  // this.timeParser = d3.timeParse("%Y-%m-%d");
  this.timeParser = d3.timeParse("%_m/%_d/%Y");
  this.timelines = [];
  this.initVis();
  console.log(dim_lawsuits);
  console.log(fct_lawsuits);
  this.initScales(fct_lawsuits);
  this.plotTimelines(fct_lawsuits, dim_lawsuits);
}

TimelineCollection.prototype.initVis = function (data) {

  var vis = this;

  vis.svg = d3.select(vis.parentElement)
    .append("svg")
    .attr("height", this.height)
    .attr("width", this.width);

  vis.svg.g = vis.svg.append("g")
    .attr('id', 'timeline-collection')
    .attr("transform", `translate(0, 10)`);
}

TimelineCollection.prototype.initScales = function(data) {
  // initialize xScale
  this.xScale = d3.scaleTime()
    .domain(
      d3.extent(data.map(x => this.timeParser(x.date)))
    )
     .range([this.padding, this.width - 2*this.padding])
     .nice();

  // plot time axis
  d3.select('#date-axis')
    .append('svg')
    .attr('width', this.width - this.padding + 30)
    .attr('height', 50)
    .call(d3.axisBottom(this.xScale));

  // initialize yScale
  this.yScale = d3.scaleLinear()
    .domain([0, Object.keys(_.groupBy(data, 'case_id')).length - 1])
    .range([0, this.height]);

  console.log(data.length);
  console.log(this.yScale(26));
}

TimelineCollection.prototype.plotTimelines = function (data, metadata) {

  data = formatCases(data);

  let parser = this.timeParser;

  console.log(data);
  data = _.sortBy(data,
    [
      function(o) { return d3.extent(o.map( x => parser(x.date)))[0]; },
      function(o) { return d3.extent(o.map( x => parser(x.date)))[1]; }
    ]
  );

  let getMetadata = function(id, d) {
    return _.filter(d, {'case_id': id})[0]
  }

  console.log(getMetadata("1", metadata));

  this.timelines = Object.fromEntries(
    Object.keys(data).map(
      (caseId, index) => { return [
        data[index][0].case_id,
        new LawsuitTimeline(
          "#timeline-collection",
          data[index],
          getMetadata(data[index][0].case_id, metadata),
          this.xScale,
          this.yScale(index),
          this.r)
        ]
      }
    )
  );

  console.log(this.timelines);
}

TimelineCollection.prototype.highlight = function (case_ids) {
  case_ids.forEach( id => this.timelines[id].highlight() );
}

TimelineCollection.prototype.unhighlight = function (case_ids) {
  case_ids.forEach( id => this.timelines[id].unhighlight() );
}
