import { Alert } from './ui/Alert';

const METRICS_LAST_UPDATED_AT = new Date('2026-04-28T11:00:00Z');

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

export const MetricsOutdatedBanner = () => (
  <Alert
    type="info"
    message={`Last updated ${METRICS_LAST_UPDATED_AT.toLocaleString('en-US', DATE_FORMAT)}`}
    description="Performance and activity stats are temporarily not updating after a recent Polymarket protocol upgrade. Your agent works as usual."
  />
);
