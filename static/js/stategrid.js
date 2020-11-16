const boxWidth = 90;
const r = 10;
const pad = 2;
const horizontalGap = 200;
const verticalGap = 100;

StateGrid = function(_parentElement, width, height, margin_left, margin_top) {
  this.parentElement = _parentElement;
  this.width = width;
  this.height = height;
  this.margin_top = margin_top;
  this.margin_left = margin_left;
  this.r = r;
  this.pad = pad;
  this.boxWidth = boxWidth;
  this.horizontalGap = horizontalGap;
  this.verticalGap = verticalGap;
  this.initVis();
}

StateGrid.prototype.initVis = function () {
  this.yScale = d3.scaleOrdinal()
    .domain(["Denied", "Won", "Appealed", "Complaint Filed"])
    .range([0, 0, 0, 0]);

  this.xScale = d3.scaleOrdinal()
    .domain(["Denied", "Won", "Appealed", "Complaint Filed"])
    .range([
      this.margin_left + this.horizontalGap,
      this.margin_left + 3*this.horizontalGap,
      this.margin_left + 2*this.horizontalGap,
      this.margin_left]);

  this.fillScale = d3.scaleOrdinal()
    .domain(["Denied", "Won", "Appealed", "Complaint Filed"])
    .range(["#FF006B", "#37db73", "#eef086", "#33CCCC"]);

  this.layout = gridLayout(
    this.boxWidth,
    2*this.r,
    2*this.r,
    this.pad,
    this.pad
  )

  var vis = this;

  vis.svg = d3.select(vis.parentElement)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  vis.svg.g = vis.svg.append("g")
    .attr("transform", `translate(0, ${this.margin_top})`);

  this.initLabels();
}

StateGrid.prototype.initLabels = function () {
  // init labels
  this.svg.g.selectAll("text")
    .data(["Denied", "Won", "Appealed", "Complaint Filed"])
    .enter()
    .append("text")
    .attr("x", (d) => {
      return this.xScale(d) - this.r;
    })
    .attr("y", (d) => {
      return this.yScale(d) - this.r - 4*this.pad;
    })
    .text((d) => {
      return d;
    })
    .style('opacity', 0.0)
    .transition()
    .style('opacity', 1.0);
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
    .attr('cx', (d) => {
      return this.xScale(d.action);
    })
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
    .attr('cx', (d) => {
      return this.xScale(d.action) + this.layout.x(groupId[d.case_id]);
    })
    .attr('cy', (d) => {
      return this.yScale(d.action) + this.layout.y(groupId[d.case_id]);
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

// return function computing x and y position for
// item given index
function gridLayout(width, itemWidth, itemHeight, horizontalPadding, verticalPadding) {
  let itemsPerRow = Math.trunc( width / (itemWidth + horizontalPadding) )

  return {
    x: function(index) {
      var col = index % itemsPerRow;
      return (itemWidth + horizontalPadding)*col;
    },
    y: function(index) {
      var row = Math.trunc(index / itemsPerRow);
      return (itemHeight + verticalPadding)*row;
    }
  }
}

function getIndexWithinGroup(data) {
  var groupId = {};
  var groupCounter = {
    'Denied': 0,
    'Won': 0,
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
