import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { DELETE, PUT } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('categories/[id] endpoint', () => {
  let locals;
  let params;
  let db;
  let statement;
  let ipcConnection;

  beforeEach(() => {
    locals = { userid: 'userid' };
    params = { id: 'id' };
    statement = { get: vi.fn(() => ({ changes: 1 })), run: vi.fn() };
    db = { transaction: vi.fn((passedFunction) => passedFunction) };
    ipcConnection = { sendMessage: vi.fn() };
    vi.mocked(inject)
      .mockReturnValueOnce(statement)
      .mockReturnValueOnce(db)
      .mockReturnValueOnce(statement)
      .mockReturnValueOnce(ipcConnection);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('PUT', () => {
    let request;

    beforeEach(() => {
      request = { text: vi.fn(() => 'text') };
    });

    it('should inject statement', async () => {
      await PUT({ locals, params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.UpdateCategoryStatement);
    });

    it('should use database', async () => {
      await PUT({ locals, params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    it('should run statement', async () => {
      await PUT({ locals, params, request });
      expect(statement.run).toHaveBeenCalledWith('text', 'id', 'userid');
    });

    it('should inject changes statement', async () => {
      await PUT({ locals, params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.ChangesStatement);
    });

    it('should run changes statement', async () => {
      await PUT({ locals, params, request });
      expect(statement.get).toHaveBeenCalled();
    });

    it('should return error if count statement fails', async () => {
      statement.get.mockReturnValue({ changes: 0 });
      const response = await PUT({ locals, params, request });
      expect(response.status).toBe(403);
      expect(response.body).toBeNull();
    });

    it('should use IPC connection', async () => {
      await PUT({ locals, params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await PUT({ locals, params, request });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await PUT({ locals, params, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('DELETE', () => {
    it('should inject statement', async () => {
      await DELETE({ locals, params });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.DeleteCategoryStatement);
    });

    it('should use database', async () => {
      await DELETE({ locals, params });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    it('should run statement', async () => {
      await DELETE({ locals, params });
      expect(statement.run).toHaveBeenCalledWith('id', 'userid');
    });

    it('should inject changes statement', async () => {
      await DELETE({ locals, params });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.ChangesStatement);
    });

    it('should run changes statement', async () => {
      await DELETE({ locals, params });
      expect(statement.get).toHaveBeenCalled();
    });

    it('should return error if count statement fails', async () => {
      statement.get.mockReturnValue({ changes: 0 });
      const response = await DELETE({ locals, params });
      expect(response.status).toBe(403);
      expect(response.body).toBeNull();
    });

    it('should use IPC connection', async () => {
      await DELETE({ locals, params });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await DELETE({ locals, params });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await DELETE({ locals, params });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});
