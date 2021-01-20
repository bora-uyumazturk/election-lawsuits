LawsuitTimeline = function(_parentElement, lawsuitData, xScale, y, r) {
  this.parentElement = _parentElement;
  this.xScale = xScale;
  this.y = y;
  this.timeParser = d3.timeParse("%Y-%m-%d");

  this.state = lawsuitData[0].state;
  this.case_name = lawsuitData[0].case_name;
  this.case_id = lawsuitData[0].case_id;

  this.r = r;

  this.initVis();
  this.update(lawsuitData);
}

LawsuitTimeline.prototype.initVis = function () {

  console.log(this.state);
  console.log(this.case_name);

  var vis = this;

  vis.g = d3.select(vis.parentElement).append("g")
    .attr("class", "timeline")
    .on('mouseover', (e) => {
      let [cx, cy] = d3.pointer(e);
      d3.select("#hover")
        .html(
          `Case Name: ${this.case_name} </br>
           Case ID: ${this.case_id} </br>
           State: ${this.state}`)
        .style('opacity', 0.75)
        .style('top', `${parseFloat(cy)}px`)
        .style('left', `${parseFloat(cx) + 10}px`);
      d3.select(e.target).attr('class', 'highlight');
    })
    .on('mouseout', (e) => {
      d3.select("#hover")
        .html('')
        .style('opacity', 0.0);
    });
}

LawsuitTimeline.prototype.update = function (lawsuitEvents) {
  var g = this.g;

  const [minDate, maxDate] = getRange(lawsuitEvents, 'date');

  let x1 = this.xScale(this.timeParser(minDate))
  let x2 = this.xScale(this.timeParser(maxDate))

  g.append("rect")
    .attr("fill", "grey")
    .attr("x", x1)
    .attr("width", x2 - x1)
    .attr("y", this.y - this.r)
    .attr("height", 2*this.r);

  g.selectAll("circle")
    .data(lawsuitEvents)
    .join(
      enter => enter.append("circle")
        .attr("cx", (d) => this.xScale(this.timeParser(d.date)))
        .attr("cy", this.y)
        .attr("r", this.r)
        .attr("fill", "white")
        .attr("stroke", 'grey')
        .attr("stroke-width", 2)
    );
}

LawsuitTimeline.prototype.highlight = function () {
  this.g.transition(500).style("opacity", 1.0);
}

LawsuitTimeline.prototype.unhighlight = function () {
  this.g.transition(500).style("opacity", 0.75);
}
