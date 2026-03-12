import { describe, it, expect, beforeEach } from 'vitest';
import {
  shouldSkipLogging,
  storeMetrics,
  getAverageResponseTime,
  getAllMetrics,
  clearMetrics,
} from '../performance-logger.middleware';

describe('Performance Logger Middleware', () => {
  beforeEach(() => {
    clearMetrics();
  });

  describe('shouldSkipLogging', () => {
    it('should skip logging for static assets', () => {
      expect(shouldSkipLogging('/_next/static/chunk.js')).toBe(true);
      expect(shouldSkipLogging('/_next/image/image.png')).toBe(true);
      expect(shouldSkipLogging('/favicon.ico')).toBe(true);
      expect(shouldSkipLogging('/assets/logo.png')).toBe(true);
    });

    it('should not skip logging for regular routes', () => {
      expect(shouldSkipLogging('/')).toBe(false);
      expect(shouldSkipLogging('/menu/test')).toBe(false);
      expect(shouldSkipLogging('/api/trpc')).toBe(false);
    });
  });

  describe('storeMetrics', () => {
    it('should store performance metrics', () => {
      const metrics = {
        path: '/test',
        method: 'GET',
        duration: 150,
        timestamp: new Date().toISOString(),
      };

      storeMetrics(metrics);
      const allMetrics = getAllMetrics();

      expect(allMetrics).toHaveLength(1);
      expect(allMetrics[0]).toEqual(metrics);
    });

    it('should limit buffer size to MAX_BUFFER_SIZE', () => {
      // Store more than MAX_BUFFER_SIZE metrics
      for (let i = 0; i < 150; i++) {
        storeMetrics({
          path: `/test-${i}`,
          method: 'GET',
          duration: 100,
          timestamp: new Date().toISOString(),
        });
      }

      const allMetrics = getAllMetrics();

      expect(allMetrics.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getAverageResponseTime', () => {
    it('should calculate average response time for a path', () => {
      const path = '/test-path';
      
      storeMetrics({ path, method: 'GET', duration: 100, timestamp: new Date().toISOString() });
      storeMetrics({ path, method: 'GET', duration: 200, timestamp: new Date().toISOString() });
      storeMetrics({ path, method: 'GET', duration: 300, timestamp: new Date().toISOString() });

      const average = getAverageResponseTime(path);

      expect(average).toBe(200);
    });

    it('should return 0 for path with no metrics', () => {
      const average = getAverageResponseTime('/non-existent-path');

      expect(average).toBe(0);
    });

    it('should only calculate for specific path', () => {
      storeMetrics({ path: '/path1', method: 'GET', duration: 100, timestamp: new Date().toISOString() });
      storeMetrics({ path: '/path2', method: 'GET', duration: 500, timestamp: new Date().toISOString() });

      const average1 = getAverageResponseTime('/path1');
      const average2 = getAverageResponseTime('/path2');

      expect(average1).toBe(100);
      expect(average2).toBe(500);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all stored metrics', () => {
      storeMetrics({ path: '/test', method: 'GET', duration: 100, timestamp: new Date().toISOString() });
      expect(getAllMetrics()).toHaveLength(1);

      clearMetrics();
      expect(getAllMetrics()).toHaveLength(0);
    });
  });

  describe('getAllMetrics', () => {
    it('should return copy of metrics array', () => {
      const metrics = { path: '/test', method: 'GET', duration: 100, timestamp: new Date().toISOString() };

      storeMetrics(metrics);

      const retrieved = getAllMetrics();

      retrieved.push({ path: '/fake', method: 'GET', duration: 50, timestamp: new Date().toISOString() });

      // Original should not be affected
      expect(getAllMetrics()).toHaveLength(1);
    });
  });
});
