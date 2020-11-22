const boxWidth = 80;
const r = 6;
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
  // this.groupId; // init case_id => group ID map
  this.groupTracker = new GroupTracker();
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
  this.stateGroup = this.svg.append('g');

  this.stateGroup.selectAll("text")
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

StateGrid.prototype.updateGroupId = function (data, groupKeys) {
  const ids = _.map(data, (x) => x.case_id);
  const keys = _.map(data, (x) => {
    return groupKeys.map((k) => x[k]);
  });
  this.groupTracker.batchUpdate(ids, keys);
}

StateGrid.prototype.update = function (
  data, duration, groupKeys=['action'], state=false, nodelay=false
) {
  var g = this.svg;

  this.updateGroupId(data, groupKeys);

  // enter => update => exit
  var u = g.selectAll('circle')
    .data(data, (d) => {
      return d.case_id;
    })

  // existing points
  u.transition(duration)
    .delay((d) => {
      if (nodelay) {
        return 1000;
      }
      return 1000 + this.layout.row(this.groupTracker.get(d.case_id))*900 +
        this.layout.col(this.groupTracker.get(d.case_id))*50;
    })
    .attr('cx', (d) => {
      return this.xScale(d.action) + this.layout.x(this.groupTracker.get(d.case_id));
    })
    .attr('cy', (d) => {
      var base = this.yScale(d.action) + this.layout.y(this.groupTracker.get(d.case_id));
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
    });

  // new points
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
    .on('mouseover', (e, d) => {
      cx = d3.select(e.target).attr('cx');
      cy = d3.select(e.target).attr('cy');
      d3.select("#hover")
        .html(
          `Case Name: ${d.case_name} </br>
           Case ID: ${d.case_id} </br>
           State: ${d.state}`)
        .style('opacity', 0.75)
        .style('top', `${parseFloat(cy) - this.r - 10}px`)
        .style('left', `${parseFloat(cx) + 3*this.r}px`);
      d3.select(e.target).style('fill-opacity', 1.0);
    })
    .on('mouseout', (e, d) => {
      d3.select("#hover")
        .html('')
        .style('opacity', 0.0);
      d3.select(e.target).style('fill-opacity', 0.3);
    })
    .transition(duration)
    .delay((d) => {
      if (nodelay) {
        return 1000;
      }
      return 1000 + this.layout.row(this.groupTracker.get(d.case_id))*900 +
        this.layout.col(this.groupTracker.get(d.case_id))*50;
    })
    .attr('cx', (d) => {
      return this.xScale(d.action) + this.layout.x(this.groupTracker.get(d.case_id));
    })
    .attr('cy', (d) => {
      var base = this.yScale(d.action) + this.layout.y(this.groupTracker.get(d.case_id));
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

    // u.exit()
    //   .remove();
}

StateGrid.prototype.pulse = function(cases) {
  // make desired cases pulse

  // borrowed from https://observablehq.com/@bumbeishvili/pulse
  function repeatPulse(d, i) {
    var circle = d3.select(this);
    (function repeat() {
      circle
        .transition()
        .ease(d3.easeLinear)
        .duration(250)
        .attr('stroke-opacity', 1.0)
        .attr('stroke-width', 1.0)
        .transition()
        .ease(d3.easeLinear)
        .duration(900)
        .attr('stroke-width', 10)
        .attr('stroke-opacity', 0.0)
        .transition()
        .ease(d3.easeLinear)
        .duration(10)
        .attr('stroke-width', 1.0)
        .attr('stroke-opacity', 0.0)
        .on('end', repeat);
    })();
  }

  this.svg.selectAll('circle')
    .filter((d, i) => {
      return inList(d.case_id, _.map(cases, (x) => x.case_id));
    })
    .each(repeatPulse);
}

StateGrid.prototype.unpulse = function(cases) {
  this.svg.selectAll('circle')
    .filter((d, i) => {
      return inList(d.case_id, _.map(cases, (x) => x.case_id));
    })
    .transition()
    .duration(500)
    .attr('stroke-width', 1.0)
    .attr('stroke-opacity', 1.0);
}

StateGrid.prototype.highlight = function(cases) {
  function highlight(d, i) {
    var fillOpacity = 0.3;
    var strokeOpacity = 1.0;

    if (inList(d.case_id, _.map(cases, (x) => x.case_id))) {
      fillOpacity = 1.0;
      strokeOpacity = 1.0;
    }
    d3.select(this)
      .transition()
      .duration(500)
      .style('fill-opacity', fillOpacity)
      .style('stroke-opacity', strokeOpacity);
  }

  this.svg.selectAll('circle')
    .each(highlight)
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


function getIndexWithinGroup(data, keys) {
  var result = {};

  var keyFunction = (d) => {
    return keys.map((k) => d[k]);
  };

  var grouped = _.groupBy(data, keyFunction);

  for (var idList of Object.values(grouped)) {
    idList = _.orderBy(idList, ['state', 'date'], ['asc']);
    for (var i = 0; i < idList.length; i++) {
      result[idList[i].case_id] = i;
    }
  }

  return result;
}
