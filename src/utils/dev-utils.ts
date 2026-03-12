/**
 * Development Utilities
 * 
 * Helper functions for development and debugging
 */

import { getAllMetrics } from '../middleware/performance-logger.middleware';
import { getRegisteredRouters, getCriticalRouters, ROUTER_METADATA } from '../server/api/router.registry';
import { APP_ROUTES, getPublicRoutes } from '../config/routes.config';

/**
 * Print performance summary to console
 */
export const printPerformanceSummary = (): void => {
  const metrics = getAllMetrics();
  
  if (metrics.length === 0) {
    console.log('📊 No performance metrics available yet');

    return;
  }

  console.log('\n📊 Performance Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Group by path
  const pathGroups = metrics.reduce((acc, metric) => {
    if (!acc[metric.path]) {
      acc[metric.path] = [];
    }

    acc[metric.path]!.push(metric.duration);

    return acc;
  }, {} as Record<string, number[]>);

  // Print stats for each path
  Object.entries(pathGroups).forEach(([path, durations]) => {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const count = durations.length;
    
    console.log(`\n${path}`);
    console.log(`  Requests: ${count}`);
    console.log(`  Average:  ${avg.toFixed(2)}ms`);
    console.log(`  Min:      ${min}ms`);
    console.log(`  Max:      ${max}ms`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * Print router registry information
 */
export const printRouterInfo = (): void => {
  const routers = getRegisteredRouters();
  const critical = getCriticalRouters();
  
  console.log('\n🔌 tRPC Router Registry');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Routers: ${routers.length}`);
  console.log(`Critical Routers: ${critical.length}`);
  console.log('\nRegistered Routers:');
  
  routers.forEach(router => {
    const meta = ROUTER_METADATA[router as keyof typeof ROUTER_METADATA];
    const isCritical = critical.includes(router);
    const icon = isCritical ? '⚠️' : '✓';
    
    console.log(`\n${icon} ${router}`);
    console.log(`   Name: ${meta.name}`);
    console.log(`   Description: ${meta.description}`);
    console.log(`   Critical: ${meta.critical ? 'Yes' : 'No'}`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * Print route configuration
 */
export const printRoutesInfo = (): void => {
  const publicRoutes = getPublicRoutes();
  
  console.log('\n🛣️  Route Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\nPublic Routes:');
  publicRoutes.forEach(route => {
    console.log(`  ✓ ${route}`);
  });
  
  console.log('\nDynamic Routes:');
  console.log('  ✓ /menu/:slug');
  console.log('  ✓ /menu/:slug/preview');
  console.log('  ✓ /menu/manage/:slug');
  console.log('  ✓ /menu/manage/:slug/qr-menu');
  
  console.log('\nAPI Routes:');
  console.log('  ✓ /api/trpc');
  console.log('  ✓ /api/sentry-example-api');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * Print all development info
 */
export const printDevInfo = (): void => {
  console.clear();
  console.log('\n🚀 MenuQR Development Info\n');
  
  printRoutesInfo();
  printRouterInfo();
  printPerformanceSummary();
};

/**
 * Check for slow routes and print warnings
 */
export const checkSlowRoutes = (thresholdMs: number = 500): void => {
  const metrics = getAllMetrics();
  const slowMetrics = metrics.filter(m => m.duration > thresholdMs);
  
  if (slowMetrics.length === 0) {
    console.log(`✅ No routes slower than ${thresholdMs}ms`);

    return;
  }
  
  console.log(`\n⚠️  Found ${slowMetrics.length} slow request(s) (>${thresholdMs}ms)\n`);
  
  slowMetrics.forEach(metric => {
    console.log(`   ${metric.method} ${metric.path} - ${metric.duration}ms`);
  });
  
  console.log('');
};

/**
 * Validate all routes are properly configured
 */
export const validateRouteConfig = (): boolean => {
  const errors: string[] = [];
  
  // Check that all routes are defined
  if (!APP_ROUTES.HOME) errors.push('HOME route not defined');
  if (!APP_ROUTES.AUTH) errors.push('AUTH routes not defined');
  if (!APP_ROUTES.MENU) errors.push('MENU routes not defined');
  if (!APP_ROUTES.API) errors.push('API routes not defined');
  
  // Check dynamic route functions
  try {
    APP_ROUTES.MENU.VIEW('test');
    APP_ROUTES.MENU.PREVIEW('test');
    APP_ROUTES.MENU.MANAGE('test');
    APP_ROUTES.MENU.QR_MENU('test');
  } catch (e) {
    errors.push('Dynamic route functions not working');
  }
  
  if (errors.length > 0) {
    console.error('❌ Route configuration errors:');
    errors.forEach(error => console.error(`   - ${error}`));

    return false;
  }
  
  console.log('✅ Route configuration is valid');

  return true;
};

// Export for use in browser console during development
if (typeof window !== 'undefined') {
  (window as Window & { devUtils: unknown }).devUtils = {
    printDevInfo,
    printPerformanceSummary,
    printRouterInfo,
    printRoutesInfo,
    checkSlowRoutes,
    validateRouteConfig,
  };
}
