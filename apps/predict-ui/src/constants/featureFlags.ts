/**
 * Polystrat metrics availability toggle.
 *
 * The Polystrat subgraph is not yet indexed with the new Safe structure, so
 * Performance, Profit Over Time and Trade History metrics are temporarily
 * unavailable. While this is `false`, the Polystrat agent shows a
 * "metrics unavailable" state that points users to Polymarket instead.
 *
 * Flip to `true` once the subgraph is indexed to restore the full metrics UI.
 * No other change is required to revert.
 */
export const ARE_POLYSTRAT_METRICS_AVAILABLE = false;
