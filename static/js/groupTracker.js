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
  this.IDtoIndex[id] = this.minAvailable(key);
  this.IDtoKey[id] = key;
}

GroupTracker.prototype.batchUpdate = function(ids, keys) {
  console.log(ids);
  for (var i = 0; i < ids.length; i++) {
    this.update(ids[i], keys[i]);
  }
}

GroupTracker.prototype.minAvailable = function(key) {
  // return minimum available index;
  var occupiedIndices = [];
  var ids = Object.keys(this.IDtoKey);
  for (var elem of ids) {
    if (keysEqual(key, this.IDtoKey[elem])) {
      occupiedIndices.push(this.IDtoIndex[elem]);
    }
  }
  occupiedIndices.sort((a, b) => a > b);
  console.log(occupiedIndices);
  var result = 0;
  for (var index of occupiedIndices) {
    if (result == index) {
      result++;
    } else {
      console.log(result);
      return result;
    }
  }
  console.log(result);
  return result;
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
