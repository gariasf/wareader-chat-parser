module.exports = function computeUserInitials(name) {
  if (name.startsWith('+') || name.startsWith('\u202a')) {
    return '#';
  }
  const nameArray = name.split(' ');
  const isNameArray = nameArray.length > 1;

  if (isNameArray) {
    return nameArray.reduce(
      (previousValue, currentValue) =>
        previousValue.charAt(0) + currentValue.charAt(0),
    );
  }
  return name.charAt(0);
};
