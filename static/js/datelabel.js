DateLabel = function(_parentElement) {
  this.parentElement = _parentElement;
}

DateLabel.prototype.update = function (dateStr) {
  console.log(d3.select(this.parentElement));
  d3.select(this.parentElement)
    .text(`Date: ${dateStr}`);
}
