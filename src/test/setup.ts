/**
 * Vitest Test Setup
 * 
 * Global setup and configuration for all test files
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables - Direct assignment works in test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
}

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: vi.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};
