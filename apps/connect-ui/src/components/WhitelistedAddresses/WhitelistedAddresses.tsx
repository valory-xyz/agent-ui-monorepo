import { Flex, Typography } from 'antd';

import { WHITELIST_LABELS } from '../../constants/whitelistLabels';
import { Whitelist } from '../../types';
import { Section } from '../../ui/Section';

const { Text } = Typography;

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

type WhitelistedAddressesProps = {
  whitelist: Whitelist;
};

export const WhitelistedAddresses = ({ whitelist }: WhitelistedAddressesProps) => (
  <Section
    title="Whitelisted addresses"
    description="Specifies allowed web3 addresses your agent can interact with."
  >
    <Flex vertical gap={16}>
      {Object.entries(whitelist).flatMap(([chain, addresses]) =>
        addresses.map((address) => {
          const label = WHITELIST_LABELS[address.toLowerCase()];
          return (
            <Flex key={`${chain}-${address}`} vertical gap={4}>
              <Text strong title={address}>
                {label ? label.name : truncateAddress(address)}
              </Text>
              <Text type="secondary">{label ? label.description : `Chain: ${chain}`}</Text>
            </Flex>
          );
        }),
      )}
    </Flex>
  </Section>
);
