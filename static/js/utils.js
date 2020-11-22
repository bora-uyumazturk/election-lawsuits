function inList(elem, list) {
  for (var newElem of list) {
    if (elem == newElem) {
      return true;
    }
  }
  return false;
}
