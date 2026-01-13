import { Tag } from 'antd';
import { CSSProperties, ReactNode } from 'react';

import { CURRENCY, CurrencyCode } from '../../constants/currency';
import { COLOR } from '../../constants/theme';
import { BetHistoryItem } from '../../types';
import { formatDuration } from '../../utils/time';

type BetStatusProps = Pick<BetHistoryItem, 'status' | 'bet_amount' | 'net_profit'> & {
  currency: CurrencyCode;
  remaining_seconds?: number;
  extra?: ReactNode;
  styles?: CSSProperties;
};

export const BetStatus = ({
  status,
  bet_amount,
  net_profit,
  currency,
  remaining_seconds,
  extra,
  styles,
}: BetStatusProps) => {
  const amount = status === 'pending' ? bet_amount : net_profit;
  const value = `${CURRENCY[currency].symbol}${Math.abs(amount)}`;

  const details = (() => {
    if (status === 'won') {
      return {
        color: COLOR.GREEN,
        background: COLOR.GREEN_BACKGROUND,
        text: `Won ${value}`,
      };
    }

    if (status === 'lost') {
      return {
        color: COLOR.PINK,
        background: COLOR.PINK_BACKGROUND,
        text: `Lost ${value}`,
      };
    }

    // If status is pending and remaining_seconds is provided
    // show countdown
    if (remaining_seconds !== undefined) {
      return {
        color: COLOR.WHITE_TRANSPARENT_75,
        background: COLOR.WHITE_TRANSPARENT_05,
        text: formatDuration(remaining_seconds),
      };
    }

    return {
      color: COLOR.WHITE_TRANSPARENT_75,
      background: COLOR.WHITE_TRANSPARENT_05,
      text: `Bet ${value}`,
    };
  })();

  return (
    <Tag
      bordered={false}
      color={details.background}
      className="mx-auto"
      style={{ color: details.color, ...styles }}
    >
      {extra ? (
        <>
          {extra}&nbsp;{details.text}
        </>
      ) : (
        details.text
      )}
    </Tag>
  );
};
