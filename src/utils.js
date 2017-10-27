export const composeRegex = (...regexps) => new RegExp(
  regexps.reduce((str, regex) => `${str}${regex.toString().slice(1, -1)}`, ''),
);

export const stringMatch = (str, matcher) => {
  const newRegex = composeRegex(/^/, matcher.regex);
  if (newRegex.test(str)) {
    if (matcher.alternatives) {
      const newStr = str.replace(newRegex, '');
      return matcher.alternatives.reduce((acc, alt) => acc || stringMatch(newStr, alt), false);
    }
    return true;
  }
  return false;
};
