function inList(elem, list) {
  for (var newElem of list) {
    if (elem == newElem) {
      return true;
    }
  }
  return false;
}

function getRange(events, key) {
  let dates = _.chain(events).map(key).value();

  return [_.min(dates), _.max(dates)];
}

function formatCases(data) {

  return _.chain(data)
           .orderBy(['date', 'case_id'])
           .groupBy('case_id')
           .value()
}
