StateGrid = function(_parentElement, width, height) {
  this.parentElement = _parentElement;
  this.width = width;
  this.height = height;
  this.margin_top = 50;
  this.r = 5;
  this.pad = 2;
  this.initVis();
}

StateGrid.prototype.initVis = function () {
  this.yScale = d3.scaleBand()
    .domain(["Denied", "Appealed", "Complaint Filed"])
    .range([this.height + this.margin_top, this.margin_top]);

  this.fillScale = d3.scaleOrdinal()
    .domain(["Denied", "Appealed", "Complaint Filed"])
    .range(["#FF006B", "#eef086", "#33CCCC"]);

  var vis = this;

  vis.svg = d3.select(vis.parentElement)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  vis.svg.g = vis.svg.append("g");

  this.initLabels();
}

StateGrid.prototype.initLabels = function () {
  // init labels
  this.svg.g.selectAll("text")
    .data(["Denied", "Appealed", "Complaint Filed"])
    .enter()
    .append("text")
    .attr("x", 0)
    .attr("y", (d) => {
      return this.yScale(d) + 5;
    })
    .text((d) => {
      return d;
    });
}

StateGrid.prototype.update = function (data) {
  var g = this.svg.g;

  // get index within group for placement
  groupId = getIndexWithinGroup(data);

  // enter => update => exit
  var u = g.selectAll('circle')
    .data(data, (d) => {
      return d.case_id;
    })

  u.enter()
    .append('circle')
    .attr('cx', 150)
    .attr('cy', (d) => {
      return this.yScale(d.action);
    })
    .attr('r', this.r)
    .attr('fill', (d) => {
      return this.fillScale(d.action);
    })
    .style('fill-opacity', 0.0)
    .attr('stroke', (d) => {
      return this.fillScale(d.action);
    })
    .attr('stroke-opacity', 0.0)
    .merge(u)
    .transition()
    // TODO: modify both x and y positions for when
    // there are more elements
    .attr('cx', (d) => {
      return 150 + groupId[d.case_id]*2*(this.r + this.pad);
    })
    .attr('cy', (d) => {
      return this.yScale(d.action);
    })
    .attr('fill', (d) => {
      return this.fillScale(d.action);
    })
    .attr('stroke', (d) => {
      return this.fillScale(d.action);
    })
    .style('fill-opacity', 0.3)
    .attr('stroke-opacity', 1.0);

    u.exit()
      .remove();
}

function getIndexWithinGroup(data) {
  var groupId = {};
  var groupCounter = {
    'Denied': 0,
    'Appealed': 0,
    'Complaint Filed': 0
  }

  for (var i = 0; i < data.length; i++) {
    var group = data[i].action;
    groupId[data[i].case_id] = groupCounter[data[i].action]
    groupCounter[data[i].action] += 1;
  }

  return groupId;
}
