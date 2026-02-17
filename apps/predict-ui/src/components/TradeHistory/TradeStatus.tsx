import { Tag } from 'antd';
import { CSSProperties, ReactNode, useMemo } from 'react';

import { CURRENCY, CurrencyCode } from '../../constants/currency';
import { COLOR } from '../../constants/theme';
import { TradeHistoryItem } from '../../types';
import { formatDuration } from '../../utils/time';

type TradeStatusProps = Pick<TradeHistoryItem, 'status' | 'bet_amount' | 'net_profit'> & {
  currency: CurrencyCode;
  remaining_seconds?: number;
  extra?: ReactNode;
  styles?: CSSProperties;
};

export const TradeStatus = ({
  status,
  bet_amount,
  net_profit,
  currency,
  remaining_seconds,
  extra,
  styles,
}: TradeStatusProps) => {
  const amount = status === 'pending' ? bet_amount : net_profit;
  const value = `${CURRENCY[currency].symbol}${Math.abs(amount)}`;

  const details = useMemo(() => {
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

    if (status === 'invalid') {
      return {
        color: COLOR.YELLOW,
        background: COLOR.YELLOW_BACKGROUND,
        text: `Invalid`,
      };
    }

    // If status is pending and remaining_seconds is provided, show countdown
    // Otherwise show the traded amount
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
      text: `Traded ${value}`,
    };
  }, [remaining_seconds, status, value]);

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
