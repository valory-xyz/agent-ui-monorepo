import { Flex } from 'antd';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { Section } from '../../ui/Section';

// Destination name — 14px, medium weight (no <strong>, per design).
const DestinationName = styled.span`
  font-weight: 450;
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_PRIMARY};
`;

// Destination hint — 12px, rgba(97, 112, 132, 1).
const DestinationDescription = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: ${COLOR.TEXT_TERTIARY};
`;

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
          <DestinationName>{destination.name}</DestinationName>
          <DestinationDescription>{destination.description}</DestinationDescription>
        </Flex>
      ))}
    </Flex>
  </Section>
);
