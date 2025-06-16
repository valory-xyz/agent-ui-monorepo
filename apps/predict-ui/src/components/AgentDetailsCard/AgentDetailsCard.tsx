import { useQuery } from '@tanstack/react-query';
import { Flex, Tag, Typography } from 'antd';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { ChartSpline } from 'lucide-react';
import { generateAgentName } from '@agent-ui-monorepo/util-functions';
import { Card } from '../../components/ui/Card';
import { COLOR } from '../../constants/theme';
import { getTimeAgo } from '../../utils/time';
import { TraderAgent } from '../../types';
import { getAgentLastTradeTimestamp } from '../../utils/graphql/queries';
import { REGISTRY_AGENTS_URL } from '../../constants/urls';

const { Title, Text } = Typography;

type AgentDetailsCardProps = {
  agent: TraderAgent & { serviceAgentId?: number };
};

export const AgentDetailsCard = ({ agent }: AgentDetailsCardProps) => {
  const { data: lastActivityTimestamp } = useQuery({
    queryKey: ['getAgentLastTradeTimestamp', agent.id],
    queryFn: async () => getAgentLastTradeTimestamp({ creator: `${agent.id}`.toLowerCase() }),
    select: (data) => data.fpmmTrades[0]?.creationTimestamp,
  });

  return (
    <Card>
      <Flex gap={24}>
        <Jazzicon
          diameter={128}
          seed={jsNumberForAddress(agent.id)}
          paperStyles={{ borderRadius: '50%' }}
        />
        <Flex vertical gap={8}>
          <Title level={3} className="mb-8">
            {generateAgentName(agent.id)}
          </Title>
          <Text type="secondary">Specialization</Text>
          <Tag icon={<ChartSpline size={20} color={COLOR.PRIMARY} />}>Trader</Tag>
          {agent.serviceAgentId && (
            <>
              <Text type="secondary" className="mt-16">
                Agent ID
              </Text>
              <a
                href={`${REGISTRY_AGENTS_URL}/${agent.serviceAgentId}`}
                target="_blank"
                rel="noreferrer"
              >
                <Text underline>{agent.serviceAgentId}</Text>
              </a>
            </>
          )}
        </Flex>
        <Text type="secondary" className="ml-auto">
          {lastActivityTimestamp && `Last active ${getTimeAgo(lastActivityTimestamp * 1000)}`}
        </Text>
      </Flex>
    </Card>
  );
};
