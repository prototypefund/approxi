export default function welfordAggregatedMean(mean = 0, count = 0, nextValue) {
  if (!Number.isFinite(nextValue)) {
    return mean;
  }
  return mean + ((nextValue - mean) / (count + 1));
};
