import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTHORIZATION_ERROR_MESSAGE,
} from '$lib/server/constants/authorization-error-message.const.js';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { protectedEndpoint } from '../protected-endpoint.js';

describe('protected endpoint', () => {
  let useCase;

  beforeEach(() => {
    useCase = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke use case', () => {
    protectedEndpoint(useCase);
    expect(useCase).toHaveBeenCalledWith();
  });

  it('should return error if authorization fails', () => {
    useCase.mockImplementationOnce(
      () => {
        throw new Error(AUTHORIZATION_ERROR_MESSAGE);
      },
    );
    const response = protectedEndpoint(useCase);
    expect(response.status).toBe(403);
    expect(response.body).toBeNull();
  });

  it('should return error if there is not enough data', () => {
    useCase.mockImplementationOnce(
      () => {
        throw new Error(LACK_OF_DATA_ERROR_MESSAGE);
      },
    );
    const response = protectedEndpoint(useCase);
    expect(response.status).toBe(400);
    expect(response.body).toBeNull();
  });

  it('should not catch other errors', () => {
    useCase.mockImplementationOnce(
      () => {
        throw new Error('Other error');
      },
    );
    expect(() => protectedEndpoint(useCase)).toThrowError('Other error');
  });

  it('should return success', () => {
    const response = protectedEndpoint(useCase);
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});
