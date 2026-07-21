import { Flex, Typography } from 'antd';

import { Section } from '../../ui/Section';

const { Text } = Typography;

// The raw whitelist is BE-owned and deliberately not rendered — instead we
// describe what the whitelisted addresses refer to. Update this list when the
// backend whitelist gains new destinations.
const WHITELISTED_DESTINATIONS = [
  {
    name: 'Olas Marketplace',
    description: 'Connects your agent to the marketplace with various services.',
  },
];

export const WhitelistedAddresses = () => (
  <Section
    title="Whitelisted addresses"
    description="Specifies allowed web3 addresses your agent can interact with."
  >
    <Flex vertical gap={16}>
      {WHITELISTED_DESTINATIONS.map((destination) => (
        <Flex key={destination.name} vertical gap={4}>
          <Text strong>{destination.name}</Text>
          <Text type="secondary">{destination.description}</Text>
        </Flex>
      ))}
    </Flex>
  </Section>
);
