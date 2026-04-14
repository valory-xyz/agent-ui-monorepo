import { notification } from 'antd';

import { EachChat } from './types';
import { handleChatError } from './utils';

describe('handleChatError', () => {
  beforeEach(() => {
    jest.spyOn(notification, 'error').mockImplementation(() => ({ destroy: jest.fn() }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a notification with the error message', () => {
    handleChatError({ error: new Error('network failure'), chats: [] });
    expect(notification.error).toHaveBeenCalledWith({
      message: 'network failure',
    });
  });

  it('falls back to "Failed to send chat." when error message is empty', () => {
    handleChatError({ error: new Error(''), chats: [] });
    expect(notification.error).toHaveBeenCalledWith({
      message: 'Failed to send chat.',
    });
  });

  it('returns null when chats array is empty', () => {
    const result = handleChatError({ error: new Error('err'), chats: [] });
    expect(result).toBeNull();
  });

  it('returns null when the last chat is type "agent"', () => {
    const chats: EachChat[] = [{ text: 'agent reply', type: 'agent' }];
    const result = handleChatError({ error: new Error('err'), chats });
    expect(result).toBeNull();
  });

  it('returns null when the last chat is type "system"', () => {
    const chats: EachChat[] = [{ text: 'system msg', type: 'system' }];
    const result = handleChatError({ error: new Error('err'), chats });
    expect(result).toBeNull();
  });

  it('returns rollback state when the last chat is a user string message', () => {
    const chats: EachChat[] = [
      { text: 'first', type: 'agent' },
      { text: 'hello', type: 'user' },
    ];
    const result = handleChatError({ error: new Error('err'), chats });
    expect(result).not.toBeNull();
    if (!result) throw new Error('result is null');
    expect(result.restoredText).toBe('hello');
    expect(result.updatedChats).toHaveLength(1);
    expect(result.updatedChats[0]).toEqual(chats[0]);
  });

  it('updatedChats is chats without the last element', () => {
    const chats: EachChat[] = [
      { text: 'a', type: 'agent' },
      { text: 'b', type: 'agent' },
      { text: 'c', type: 'user' },
    ];
    const result = handleChatError({ error: new Error('e'), chats });
    expect(result).not.toBeNull();
    if (!result) throw new Error('result is null');
    expect(result.updatedChats).toHaveLength(2);
  });

  it('does not mutate the original chats array', () => {
    const chats: EachChat[] = [{ text: 'msg', type: 'user' }];
    const original = [...chats];
    handleChatError({ error: new Error('e'), chats });
    expect(chats).toEqual(original);
  });
});
