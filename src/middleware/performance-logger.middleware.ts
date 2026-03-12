/**
 * Performance Logging Middleware
 * 
 * Lightweight middleware to monitor and log response times for all requests.
 * Useful for identifying performance bottlenecks and slow routes.
 */

import { type NextRequest, NextResponse } from 'next/server';

interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: string;
  statusCode?: number;
}

/**
 * Log performance metrics
 */
const logPerformance = (metrics: PerformanceMetrics): void => {
  const { path, method, duration, timestamp, statusCode } = metrics;
  
  // Color-coded console output based on response time
  let color = '\x1b[31m';

  if (duration < 100) {
    color = '\x1b[32m';
  } else if (duration < 500) {
    color = '\x1b[33m';
  }

  const reset = '\x1b[0m';
  
  console.log(
    `${color}[PERF]${reset} ${method} ${path} - ${duration}ms${statusCode ? ` (${statusCode})` : ''} - ${timestamp}`
  );
  
  // Warn about slow requests
  if (duration > 1000) {
    console.warn(`⚠️  Slow request detected: ${method} ${path} took ${duration}ms`);
  }
};

/**
 * Store performance metrics for analytics
 * In production, you might want to send these to a monitoring service
 */
const performanceBuffer: PerformanceMetrics[] = [];
const MAX_BUFFER_SIZE = 100;

export const storeMetrics = (metrics: PerformanceMetrics): void => {
  performanceBuffer.push(metrics);
  
  // Keep buffer size manageable
  if (performanceBuffer.length > MAX_BUFFER_SIZE) {
    performanceBuffer.shift();
  }
};

/**
 * Get average response time for a specific path
 */
export const getAverageResponseTime = (path: string): number => {
  const pathMetrics = performanceBuffer.filter(m => m.path === path);
  
  if (pathMetrics.length === 0) return 0;
  
  const totalDuration = pathMetrics.reduce((sum, m) => sum + m.duration, 0);

  return totalDuration / pathMetrics.length;
};

/**
 * Get all stored metrics
 */
export const getAllMetrics = (): PerformanceMetrics[] => {
  return [...performanceBuffer];
};

/**
 * Clear all stored metrics
 */
export const clearMetrics = (): void => {
  performanceBuffer.length = 0;
};

/**
 * Performance logging middleware function
 */
export const performanceLogger = (req: NextRequest): NextResponse => {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  
  // Create response
  const response = NextResponse.next();
  
  // Calculate duration after response is ready
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  
  const metrics: PerformanceMetrics = {
    path: req.nextUrl.pathname,
    method: req.method,
    duration,
    timestamp,
  };
  
  // Log performance
  logPerformance(metrics);
  
  // Store for analytics
  storeMetrics(metrics);
  
  // Add performance header to response
  response.headers.set('X-Response-Time', `${duration}ms`);
  
  return response;
};

/**
 * Check if performance logging should be skipped for this path
 */
export const shouldSkipLogging = (pathname: string): boolean => {
  const skipPatterns = [
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '/assets',
    '/sw.js',
    '/icon',
    '/chrome',
  ];
  
  return skipPatterns.some(pattern => pathname.startsWith(pattern));
};
