DateLabel = function(_parentElement, margin_left, margin_top) {
  this.parentElement = _parentElement;
  this.margin_left = margin_left;
  this.margin_top = margin_top;
  this.initVis();
}

DateLabel.prototype.initVis = function () {
  d3.select(this.parentElement)
    .style("position", "relative")
    .style("left", this.margin_left + "px")
    .style("top", this.margin_top + "px")
    .text(`Date: `);
}

DateLabel.prototype.update = function (dateStr) {
  d3.select(this.parentElement)
    .text(`Date: ${dateStr}`);
}
