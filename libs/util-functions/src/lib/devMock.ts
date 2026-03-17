/**
 * Returns the result of `mockFn` when IS_MOCK_ENABLED=true, otherwise null.
 * Use this in queryFn bodies to gate mock data paths:
 *
 *   const mock = devMock(() => delay(mockData));
 *   if (mock !== null) return mock;
 *
 * The entire function is excluded from coverage — mock paths are unreachable
 * in tests since IS_MOCK_ENABLED is always false in jest.setup.ts.
 */
/* istanbul ignore next */
export function devMock<T>(mockFn: () => T): T | null {
  if (process.env['IS_MOCK_ENABLED'] !== 'true') return null;
  return mockFn();
}
