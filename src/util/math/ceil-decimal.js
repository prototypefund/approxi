export default function ceilDecimal(n, nextMagnitude = false) {
  const nn = n || 1;
  const method = nextMagnitude ? 'ceil' : 'floor';
  const sign = Math.sign(nn);
  const abs = Math.abs(nn);
  const exp = Math[method](Math.log10(abs));
  const decimals = Math.max(0, -exp);
  const baseExp = 10 ** exp;
  let coeff = 1;
  if (!nextMagnitude) {
    // coeff = abs / baseExp;
    // coeff = Number.isInteger(coeff) ? coeff : Math.trunc(coeff) + 1;
    coeff = Math.trunc(abs / baseExp) + 1;
  }
  const next = sign * coeff * baseExp;
  return Number(next.toFixed(decimals));
};
