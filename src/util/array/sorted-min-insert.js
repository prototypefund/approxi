import bsearch from 'binary-search';
import { compare as mathCompare } from 'mathjs';

export default function sortedArrayMinInsert(a, maxLength, value, compare = mathCompare) {
  if (!a) {
    return;
  }
  let index = bsearch(a, value, (x, y) => compare(x, y));
  if (index < 0) {
    index = ~index;
    a.splice(index, 0, value);
    if (a.length > maxLength) {
      a.pop();
    }
  }
};
