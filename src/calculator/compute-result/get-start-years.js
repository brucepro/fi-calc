import _ from 'lodash';
import marketData from 'stock-market-data';

// Returns an array of starting years for a calculation.
// For now, it returns every year within `market-data.json`, which represents
// a calculation that takes into account all of history. In the future,
// this could be more customizable based on user input.
export default function getStartYears(duration) {
  const startYears = _.chain(marketData)
    .filter(data => data.month === '01')
    .map(data => Number(data.year))
    .value();

  if (typeof duration === 'number' && !Number.isNaN(duration)) {
    return _.dropRight(startYears, duration - 1);
  } else {
    return startYears;
  }
}
