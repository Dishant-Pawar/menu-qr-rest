// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  ROUTER_REGISTRY,
  ROUTER_METADATA,
  getRegisteredRouters,
  isRouterRegistered,
  getCriticalRouters,
  appRouter,
} from '../router.registry';

describe('tRPC Router Registry', () => {
  describe('ROUTER_REGISTRY', () => {
    it('should have all required routers registered', () => {
      expect(ROUTER_REGISTRY).toHaveProperty('menus');
      expect(ROUTER_REGISTRY).toHaveProperty('auth');
      expect(ROUTER_REGISTRY).toHaveProperty('languages');
      expect(ROUTER_REGISTRY).toHaveProperty('payments');
      expect(ROUTER_REGISTRY).toHaveProperty('user');
    });

    it('should have router objects defined', () => {
      expect(ROUTER_REGISTRY.menus).toBeDefined();
      expect(ROUTER_REGISTRY.auth).toBeDefined();
      expect(ROUTER_REGISTRY.languages).toBeDefined();
      expect(ROUTER_REGISTRY.payments).toBeDefined();
      expect(ROUTER_REGISTRY.user).toBeDefined();
    });
  });

  describe('ROUTER_METADATA', () => {
    it('should have metadata for all routers', () => {
      const registryKeys = Object.keys(ROUTER_REGISTRY);
      const metadataKeys = Object.keys(ROUTER_METADATA);

      registryKeys.forEach(key => {
        expect(metadataKeys).toContain(key);
      });
    });

    it('should have required metadata fields', () => {
      Object.values(ROUTER_METADATA).forEach(meta => {
        expect(meta).toHaveProperty('name');
        expect(meta).toHaveProperty('description');
        expect(meta).toHaveProperty('critical');
      });
    });

    it('should mark critical routers correctly', () => {
      expect(ROUTER_METADATA.menus.critical).toBe(true);
      expect(ROUTER_METADATA.auth.critical).toBe(true);
      expect(ROUTER_METADATA.payments.critical).toBe(true);
      expect(ROUTER_METADATA.languages.critical).toBe(false);
    });
  });

  describe('getRegisteredRouters', () => {
    it('should return array of router names', () => {
      const routers = getRegisteredRouters();
      
      expect(Array.isArray(routers)).toBe(true);
      expect(routers).toContain('menus');
      expect(routers).toContain('auth');
      expect(routers).toContain('languages');
      expect(routers).toContain('payments');
      expect(routers).toContain('user');
    });

    it('should return correct number of routers', () => {
      const routers = getRegisteredRouters();

      expect(routers.length).toBe(5);
    });
  });

  describe('isRouterRegistered', () => {
    it('should return true for registered routers', () => {
      expect(isRouterRegistered('menus')).toBe(true);
      expect(isRouterRegistered('auth')).toBe(true);
      expect(isRouterRegistered('languages')).toBe(true);
      expect(isRouterRegistered('payments')).toBe(true);
      expect(isRouterRegistered('user')).toBe(true);
    });

    it('should return false for non-registered routers', () => {
      expect(isRouterRegistered('nonexistent')).toBe(false);
      expect(isRouterRegistered('users')).toBe(false);
      expect(isRouterRegistered('')).toBe(false);
    });
  });

  describe('getCriticalRouters', () => {
    it('should return only critical routers', () => {
      const critical = getCriticalRouters();
      
      expect(critical).toContain('menus');
      expect(critical).toContain('auth');
      expect(critical).toContain('payments');
      expect(critical).not.toContain('languages');
    });

    it('should return array of strings', () => {
      const critical = getCriticalRouters();

      expect(Array.isArray(critical)).toBe(true);
      critical.forEach(router => {
        expect(typeof router).toBe('string');
      });
    });
  });

  describe('appRouter', () => {
    it('should be defined', () => {
      expect(appRouter).toBeDefined();
    });

    it('should have router methods', () => {
      expect(appRouter).toHaveProperty('createCaller');
      expect(appRouter).toHaveProperty('_def');
    });
  });
});
