export const formatTimestampToMonthDay = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
};
