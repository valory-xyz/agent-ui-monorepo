import { REACT_QUERY_KEYS } from '../../src/constants/reactQueryKeys';

describe('REACT_QUERY_KEYS', () => {
  it('contains unique values', () => {
    const values = Object.values(REACT_QUERY_KEYS);
    expect(new Set(values).size).toBe(values.length);
  });
});
