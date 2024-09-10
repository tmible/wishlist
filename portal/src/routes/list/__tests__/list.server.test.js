import { fail } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../+page.server.js';

describe('list server', () => {
  let formData;
  let request;
  let fetch;

  beforeEach(() => {
    formData = new FormData();
    formData.set('method', 'method');
    formData.set('listItemId', 'listItemId');
    request = { formData: vi.fn(() => formData) };
    fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if method equals "POST"', () => {
    beforeEach(() => {
      formData.set('method', 'POST');
    });

    it('should send request', async () => {
      await actions.default({ request, fetch });
      expect(
        fetch,
      ).toHaveBeenCalledWith(
        '/api/wishlist',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify(Object.fromEntries(formData)),
        },
      );
    });

    it('should return success', async () => {
      expect(await actions.default({ request, fetch })).toEqual({ success: true });
    });
  });

  describe('if method equals "PUT" and listItemId is present', () => {
    beforeEach(() => {
      formData.set('method', 'PUT');
    });

    it('should send request', async () => {
      await actions.default({ request, fetch });
      expect(
        fetch,
      ).toHaveBeenCalledWith(
        '/api/wishlist/listItemId',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify(Object.fromEntries(formData)),
        },
      );
    });

    it('should return success', async () => {
      expect(await actions.default({ request, fetch })).toEqual({ success: true });
    });
  });

  it('should return error if method is neither "POST", nor "PUT"', async () => {
    expect(await actions.default({ request, fetch })).toEqual(fail(400));
  });

  it('should return error if method id "PUT", but listItemId is not present', async () => {
    formData.set('method', 'PUT');
    formData.delete('listItemId');
    expect(await actions.default({ request, fetch })).toEqual(fail(400));
  });
});
