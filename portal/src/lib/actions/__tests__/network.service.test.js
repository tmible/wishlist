import { describe, expect, it, vi } from 'vitest';
import { sendAction } from '../network.service.js';

vi.stubGlobal('fetch', vi.fn());

describe('actions / network service', () => {
  it('should send action', async () => {
    vi.spyOn(Date, 'now').mockReturnValue('now');
    await sendAction('action');
    expect(
      vi.mocked(fetch),
    ).toHaveBeenCalledWith(
      '/api/actions',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({
          timestamp: 'now',
          action: 'action',
        }),
      },
    );
  });
});
