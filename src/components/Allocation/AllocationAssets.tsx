import { Avatar, Flex, Typography } from 'antd';
import React from 'react';

import { Pill } from '../../ui/Pill';

type AssetBadgeProps = { asset: string; isLast?: boolean };

const AssetBadge = ({ asset, isLast = true }: AssetBadgeProps) => (
  <Pill style={{ padding: '2px 6px 2px 8px' }}>
    <Avatar size={20} src={`/logos/tokens/${asset.toLowerCase()}.png`} />
    <Typography.Text>{asset}</Typography.Text>
    {!isLast && <div style={{ width: 20 }} />}
  </Pill>
);

export const AssetBadges = ({ assets }: { assets: string[] }) => {
  if (assets.length === 0) return;
  if (assets.length === 1) return <AssetBadge asset={assets[0]} />;
  if (!assets.map) return;

  return (
    <Flex wrap="wrap" gap={2}>
      {assets.map((asset, i) => (
        <AssetBadge key={asset} asset={asset} isLast={i >= assets.length - 1} />
      ))}
    </Flex>
  );
};
