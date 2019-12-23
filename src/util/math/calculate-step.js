import decimalPlaces from './decimal-places';

export default function calculateStep(values) {
  let decimals = Math.max.apply(null, values.filter(v =>
    Number.isFinite(v)
  ).map(v =>
    decimalPlaces(v)
  ));
  if (decimals > 0) {
    return Number((0.1 ** decimals).toFixed(decimals));
  }
  decimals = Math.min.apply(null, values.filter(v =>
    Number.isFinite(v)
  ).map(v => {
    const s = String(Math.trunc(v));
    const sn0 = s.replace(/^(\d*?[1-9])0+$/, '$1');
    return s.length - sn0.length;
  }));
  return Number((10 ** decimals).toFixed(0));
};
