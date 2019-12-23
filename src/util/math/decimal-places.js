export default function decimalPlaces(num) {
  // TODO: hack, not floating-point-proof if used in calculations (e. g.: 0.1 + 0.2)
  if (num === 0) {
    return 0;
  }
  const match = (`${num}`).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return 0;
  }
  return Math.max(
    0,
    (match[1] ? match[1].length : 0) - // Number of digits right of decimal point.
    (match[2] ? +match[2] : 0) // Adjust for scientific notation.
  );
};
