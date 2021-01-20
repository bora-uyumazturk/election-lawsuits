TimelineCollection = function(_parentElement, data, height, width, padding, r) {
  this.parentElement = _parentElement;
  this.height = height;
  this.width = width;
  this.padding = padding;
  this.r = r;
  this.timeParser = d3.timeParse("%Y-%m-%d");
  this.timelines = [];
  this.initVis();
  console.log(data);
  this.initScales(data);
  this.plotTimelines(data);
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
  const [minDate, maxDate] = getRange(data, 'date');
  console.log(maxDate);

  // initialize xScale
  this.xScale = d3.scaleTime()
    .domain(
      [this.timeParser(minDate),
       this.timeParser(maxDate)]
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
  console.log(this.yScale(31));
}

TimelineCollection.prototype.plotTimelines = function (data) {

  data = formatCases(data);

  data = _.sortBy(data,
    [
      function(o) { return o[0].date; },
      function(o) { return o[o.length - 1].date }
    ]);
  console.log(data);

  this.timelines = Object.fromEntries(
    Object.keys(data).map(
      (caseId, index) => { return [
        data[index][0].case_id,
        new LawsuitTimeline(
          "#timeline-collection",
          data[index],
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
