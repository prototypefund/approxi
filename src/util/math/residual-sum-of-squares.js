export default function residualSumOfSquares(a, b) {
  const reducer = (accumulator, current, index) => {
    const diff = Math.abs(current - b[index]);
    const rss = (diff ** 2) + accumulator;
    return rss;
  };
  return a.reduce(reducer, 0);
};
