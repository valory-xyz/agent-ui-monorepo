import { ChatResponse } from '../types';

const reasoningMock = `
<div class="container">
  <p>Got it! I’ve adjusted my strategy to prioritize higher-reward pools while keeping risk under control. Here’s what I updated based on your input:</p>
  <ul>
    <li><span class="bold">Sharpe Ratio Threshold:</span> Increased from <strong>1</strong> to <strong>1.2</strong> to focus on pools with better risk-adjusted returns.</li>
    <li><span class="bold">Depth Score Threshold:</span> Raised from <strong>50</strong> to <strong>60</strong> to ensure we only enter highly liquid pools.</li>
    <li><span class="bold">IL Risk Score Threshold:</span> Adjusted from <strong>-0.05</strong> to <strong>-0.03</strong> to minimize exposure to impermanent loss.</li>
    <li><span class="bold">Minimum Composite Score Ratio:</span> Increased from <strong>0.5</strong> to <strong>0.6</strong> to apply stricter filtering on pool selection.</li>
  </ul>
  <p>These updates should help us capture more profitable opportunities while keeping things safe. Let me know if you’d like me to tweak anything further!</p>
</div>
`;

export const mockChat: ChatResponse = {
  selected_protocols: ['balancerPool', 'sturdy', 'velodrome'],
  trading_type: 'risky',
  previous_trading_type: 'balanced',
  reasoning: reasoningMock,
} as const;
