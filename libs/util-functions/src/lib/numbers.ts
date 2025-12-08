/**
 * Displays balance in a human readable format
 * @example 1234.578 => 1,234.58
 */
export const formatNumber = (
  value: number | undefined,
  decimals = 2,
  round: 'ceil' | 'floor' = 'ceil',
): string | null => {
  if (value === undefined || value === null) return null;

  // Round the value to the specified number of decimals
  const factor = 10 ** decimals;
  const adjustedValue = value * factor;

  const rounded =
    round === 'ceil' ? Math.ceil(adjustedValue) / factor : Math.floor(adjustedValue) / factor;

  // Format the number with commas and the specified decimals
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(rounded);
};
