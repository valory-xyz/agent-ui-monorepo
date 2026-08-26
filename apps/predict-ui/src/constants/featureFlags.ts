/**
 * Polystrat metrics availability toggle.
 *
 * While `true`, the Polystrat agent renders the full metrics UI (Performance,
 * Profit Over Time, Trade History). Set to `false` if the subgraph data
 * becomes unreliable again: the metric sections are then hidden behind a
 * "metrics unavailable" state that points users to Polymarket instead, and
 * the page stops depending on `/agent/performance`. No other change is
 * required in either direction.
 */
export const ARE_POLYSTRAT_METRICS_AVAILABLE = true;
