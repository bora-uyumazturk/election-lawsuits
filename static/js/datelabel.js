DateLabel = function(_parentElement) {
  this.parentElement = _parentElement;
}

DateLabel.prototype.update = function (dateStr) {
  d3.select(this.parentElement)
    .text(`Date: ${dateStr}`);
}
