import { Flex, Typography } from 'antd';

import { Whitelist } from '../../types';
import { Section } from '../../ui/Section';

const { Text } = Typography;

// The whitelist is BE-owned and read-only, so entries render as-is (address +
// chain). Friendly names should come from the backend if/when whitelist
// editing is added — a client-side label map would drift on mech-client
// upgrades.
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
        addresses.map((address) => (
          <Flex key={`${chain}-${address}`} vertical gap={4}>
            <Text strong title={address}>
              {truncateAddress(address)}
            </Text>
            <Text type="secondary">Chain: {chain}</Text>
          </Flex>
        )),
      )}
    </Flex>
  </Section>
);
