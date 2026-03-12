import { describe, it, expect } from 'vitest';
import { 
  APP_ROUTES, 
  isPublicRoute, 
  isProtectedRoute,
  getPublicRoutes 
} from '../routes.config';

describe('Route Configuration', () => {
  describe('APP_ROUTES', () => {
    it('should define home route', () => {
      expect(APP_ROUTES.HOME).toBe('/');
    });

    it('should define auth routes', () => {
      expect(APP_ROUTES.AUTH.LOGIN).toBe('/login');
      expect(APP_ROUTES.AUTH.REGISTER).toBe('/register');
    });

    it('should define menu routes with dynamic slugs', () => {
      expect(APP_ROUTES.MENU.VIEW('test-menu')).toBe('/menu/test-menu');
      expect(APP_ROUTES.MENU.PREVIEW('test-menu')).toBe('/menu/test-menu/preview');
      expect(APP_ROUTES.MENU.CREATE).toBe('/menu/create');
    });

    it('should define API routes', () => {
      expect(APP_ROUTES.API.TRPC).toBe('/api/trpc');
    });
  });

  describe('isPublicRoute', () => {
    it('should return true for public routes', () => {
      expect(isPublicRoute('/')).toBe(true);
      expect(isPublicRoute('/login')).toBe(true);
      expect(isPublicRoute('/register')).toBe(true);
      expect(isPublicRoute('/privacy-policy')).toBe(true);
    });

    it('should return false for protected routes', () => {
      expect(isPublicRoute('/menu/create')).toBe(false);
      expect(isPublicRoute('/menu/manage/test')).toBe(false);
    });
  });

  describe('isProtectedRoute', () => {
    it('should return true for protected routes', () => {
      expect(isProtectedRoute('/menu/create')).toBe(true);
      expect(isProtectedRoute('/menu/manage/test-menu')).toBe(true);
    });

    it('should return false for public routes', () => {
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/login')).toBe(false);
      expect(isProtectedRoute('/menu/test-menu')).toBe(false);
    });
  });

  describe('getPublicRoutes', () => {
    it('should return array of public routes', () => {
      const publicRoutes = getPublicRoutes();

      expect(Array.isArray(publicRoutes)).toBe(true);
      expect(publicRoutes).toContain('/');
      expect(publicRoutes).toContain('/login');
      expect(publicRoutes.length).toBeGreaterThan(0);
    });
  });
});
