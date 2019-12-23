import decimalPlaces from './decimal-places';

export default function isDivisible(a, b) {
  const factor = 10 ** decimalPlaces(b);
  a *= factor;
  b *= factor;
  return (a % (b || 1) === 0);
};
