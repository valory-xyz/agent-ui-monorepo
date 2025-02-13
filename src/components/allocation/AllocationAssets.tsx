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

const AssetBadges = ({ assets }: { assets: string[] }) => (
  <Flex>
    {assets.map((asset, i) => (
      <AssetBadge asset={asset} isLast={i >= assets.length - 1} />
    ))}
  </Flex>
);

export const AllocationAssets = ({ assets }: { assets: string[] }) => {
  switch (assets.length) {
    case 0:
      return 'N/A';
    case 1:
      return <AssetBadge asset={assets[0]} />;
    case 2:
    case 3:
    default:
      return <AssetBadges assets={assets} />;
  }
};
