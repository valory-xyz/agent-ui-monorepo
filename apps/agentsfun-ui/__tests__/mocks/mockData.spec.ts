import {
  mockAgentInfo,
  mockChat,
  mockMedia,
  mockMemecoinActivity,
  mockPerformanceSummary,
  mockXActivity,
} from '../../src/mocks/mock';
import { mockFeatures as mockFeaturesFlag } from '../../src/mocks/mockFeatures';

describe('agentsfun-ui mock data', () => {
  it('matches the expected structural shape', () => {
    expect(mockAgentInfo.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(mockChat.reasoning.length).toBeGreaterThan(0);
    expect(mockFeaturesFlag.isChatEnabled).toBe(true);
    expect(mockXActivity.postId).toMatch(/^\d+$/);
    expect(mockXActivity.media).toHaveLength(1);
    expect(mockMemecoinActivity).toHaveLength(2);
    expect(mockMedia.every((item) => item.type === 'image' || item.type === 'video')).toBe(true);
    expect(mockPerformanceSummary.metrics).toHaveLength(2);
  });
});
