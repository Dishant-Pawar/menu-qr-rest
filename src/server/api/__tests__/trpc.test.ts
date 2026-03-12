// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createTRPCContext } from '../trpc';

describe('tRPC Context Creation', () => {
  describe('createTRPCContext', () => {
    it('should create context without auth token', async () => {
      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx).toHaveProperty('db');
      expect(ctx).toHaveProperty('user');
      expect(ctx.user).toBeNull();
    });

    it('should include headers in context', async () => {
      const headers = new Headers();

      headers.set('x-test-header', 'test-value');
      
      const ctx = await createTRPCContext({ headers });

      expect(ctx).toHaveProperty('headers');
      expect(ctx.headers).toBe(headers);
    });

    it('should have database instance', async () => {
      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx.db).toBeDefined();
    });
  });
});
