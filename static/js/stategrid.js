const boxWidth = 80;
const r = 5;
const pad = 4;
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
  this.lawsuitStates = ["Denied", "Won", "Appealed", "Complaint Filed"];

  this.yScale = d3.scaleOrdinal()
    .domain(["Denied", "Won", "Appealed", "Complaint Filed"])
    .range([this.margin_top,
      this.margin_top, this.margin_top, this.margin_top]);

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
    .attr("transform", `translate(0, ${this.margin_top - 40})`);
}

StateGrid.prototype.initStateScale = function (states) {
  this.states = states;
  console.log(states);
  yRanges = [];
  increment = this.height / (states.length + 2);
  for (var i = 0; i < states.length; i++) {
    yRanges[i] = increment*(i+1) + increment;
  }
  this.stateYScale = d3.scaleOrdinal()
    .domain(states)
    .range(yRanges);
}

StateGrid.prototype.initStateLabels = function () {
  // init labels
  // this.svg.append("g")
  //   .attr("transform", "translate(0, 0)")
  var g = this.svg.append('g');

  g.selectAll("text")
    // .data(["Denied", "Won", "Appealed", "Complaint Filed"])
    .data(this.states)
    .enter()
    .append("text")
    .attr("x", (d) => {
      return 0;
    })
    .attr("y", (d) => {
      return this.stateYScale(d) + this.r;
    })
    .text((d) => {
      return d;
    })
    .style('opacity', 0.0)
    .transition()
    .style('opacity', 1.0);
}

StateGrid.prototype.updateLabels = function (labels) {
  // each label is an objects with keys
  // category and label

  // init labels
  this.svg.g.selectAll("text")
    // .data(["Denied", "Won", "Appealed", "Complaint Filed"])
    .data(labels)
    .enter()
    .append("text")
    .attr("x", (d) => {
      return this.xScale(d.category) - this.r;
    })
    .attr("y", (d) => {
      return this.yScale(d.category) - this.r - 4*this.pad;
    })
    .text((d) => {
      return d.label;
    })
    .style('opacity', 0.0)
    .transition()
    .style('opacity', 1.0);
}


StateGrid.prototype.update = function (
  data, duration,state=false, nodelay=false
) {
  var g = this.svg;

  // get index within group for placement
  console.log(this.lawsuitStates);
  var groupId = getIndexWithinGroup(data, this.lawsuitStates, 'action');
  console.log(groupId);

  // enter => update => exit
  var u = g.selectAll('circle')
    .data(data, (d) => {
      return d.case_id;
    })

  u.enter()
    .append('circle')
    .attr('cx', (d) => {
      // return this.xScale(d.action);
      return this.width / 2;
    })
    .attr('cy', (d) => {
      // return this.yScale(d.action);
      return -100;
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
    .transition(duration)
    .delay((d) => {
      if (nodelay) {
        return 1000;
      }
      return 1000 + this.layout.row(groupId[d.case_id])*900 +
        this.layout.col(groupId[d.case_id])*50;
    })
    .attr('cx', (d) => {
      return this.xScale(d.action) + this.layout.x(groupId[d.case_id]);
    })
    .attr('cy', (d) => {
      var base = this.yScale(d.action) + this.layout.y(groupId[d.case_id]);
      if (state) {
        return this.stateYScale(d.state);
      }
      return base;
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
    col: function(index) {
      return index % itemsPerRow;
    },
    row: function(index) {
      return Math.trunc(index / itemsPerRow);
    },
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

function getIndexWithinGroup(data, groups, key) {
  var groupId = {};
  var groupCounter = {}
  for (const elem of groups) {
    groupCounter[elem] = 0;
  }
  console.log(groupCounter);

  for (var i = 0; i < data.length; i++) {
    var group = data[i][key];
    groupId[data[i].case_id] = groupCounter[data[i][key]]
    groupCounter[data[i][key]] += 1;
  }
  return groupId;
}
