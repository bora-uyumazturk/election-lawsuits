GroupTracker = function() {
  this.IDtoIndex = {};
  this.IDtoKey = {};
  this.groupLengths = {};
}

GroupTracker.prototype.get = function(id) {
  return this.IDtoIndex[id];
}

GroupTracker.prototype.update = function(id, key) {
  if (keysEqual(key, this.IDtoKey[id])) {
    return;
  }
  if (key in this.groupLengths) {
    this.IDtoIndex[id] = this.groupLengths[key];
    this.groupLengths[key]++;
  } else {
    this.IDtoIndex[id] = 0;
    this.groupLengths[key] = 1;
  }
  this.IDtoKey[id] = key;
}

GroupTracker.prototype.batchUpdate = function(ids, keys) {
  for (var i = 0; i < ids.length; i++) {
    this.update(ids[i], keys[i]);
  }
}

function keysEqual(a, b) {
  if (a === undefined || b === undefined) {
    return false;
  }
  if (a.length != b.length) {
    return false;
  }

  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }

  return true;

}
