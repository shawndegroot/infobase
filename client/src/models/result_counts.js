
function compute_counts_from_set({results, indicators}){
  const drr17_indicators = _.filter(indicators, { doc: 'drr17'}),
    drr17_indicators_met = _.filter(drr17_indicators, {status_key: 'met'}).length,
    drr17_indicators_not_met = _.filter(drr17_indicators, {status_key: 'not_met'}).length,
    drr17_indicators_not_available = _.filter(drr17_indicators, {status_key: 'not_available'}).length,
    drr17_indicators_future = _.filter(drr17_indicators, {status_key: 'future'}).length,

    drr17_past_total = drr17_indicators_not_available + drr17_indicators_met + drr17_indicators_not_met,
    drr17_future_total = drr17_indicators_future,

    drr17_total = drr17_past_total + drr17_future_total;

  return {
    dp18_results: _.filter(results, { doc: 'dp18' }).length,
    dp18_indicators: _.filter(indicators, { doc: 'dp18' }).length,
    drr17_results: _.filter(results, { doc: 'drr17' }).length,

    drr17_indicators_met,
    drr17_indicators_not_met,
    drr17_indicators_not_available,
    drr17_indicators_future,

    drr17_past_total,
    drr17_future_total,
    drr17_total,
  };
}

export { compute_counts_from_set };