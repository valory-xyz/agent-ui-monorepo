import { Tag } from 'antd';

import { CURRENCY, CurrencyCode } from '../../constants/currency';
import { COLOR } from '../../constants/theme';
import { BetHistoryItem } from '../../types';

type BetStatusProps = Pick<BetHistoryItem, 'status' | 'bet_amount' | 'net_profit'> & {
  currency: CurrencyCode;
};
export const BetStatus = ({ status, bet_amount, net_profit, currency }: BetStatusProps) => {
  const amount = status === 'pending' ? bet_amount : net_profit;
  const value = `${CURRENCY[currency].symbol}${Math.abs(amount)}`;

  const details = (() => {
    if (status === 'won') {
      return { color: COLOR.GREEN, background: COLOR.GREEN_BACKGROUND, text: `Won ${value}` };
    }
    if (status === 'lost') {
      return { color: COLOR.PINK, background: COLOR.PINK_BACKGROUND, text: `Lost ${value}` };
    }
    return {
      color: COLOR.WHITE_TRANSPARENT_75,
      background: COLOR.WHITE_TRANSPARENT_5,
      text: `Bet ${value}`,
    };
  })();

  return (
    <Tag
      bordered={false}
      color={details.background}
      className="mx-auto"
      style={{ color: details.color }}
    >
      {details.text}
    </Tag>
  );
};
