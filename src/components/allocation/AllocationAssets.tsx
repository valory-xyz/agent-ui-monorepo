import { Avatar, Flex, Typography } from 'antd';
import React from 'react';

const AssetBadge = ({
  asset,
  isLast = true,
}: {
  asset: string;
  isLast?: boolean;
}) => (
  <Flex
    gap={4}
    align="center"
    style={{
      border: '2px solid #DFE5EE',
      display: 'inline-flex',
      padding: '2px 4px',
      borderRadius: 32,
      marginLeft: -28,
      paddingRight: 8,
      background: 'white',
    }}
  >
    <Avatar size={20} src={`/logos/tokens/${asset.toLowerCase()}.png`} />
    <Typography.Text>{asset}</Typography.Text>
    {!isLast && <div style={{ width: 20 }} />}
  </Flex>
);

export const AssetBadges = ({ assets }: { assets: string[] }) => {
  if (assets.length === 0) return;
  if (assets.length === 1) return <AssetBadge asset={assets[0]} />;
  if (!assets.map) return;

  return (
    <Flex>
      {assets.map((asset, i) => (
        <AssetBadge key={asset} asset={asset} isLast={i >= assets.length - 1} />
      ))}
    </Flex>
  );
};
