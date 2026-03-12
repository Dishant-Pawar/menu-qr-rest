/**
 * Centralized Route Configuration
 * 
 * This module serves as a single source of truth for all application routes.
 * It provides consistent naming and easy maintenance of route definitions.
 */

export const APP_ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRIVACY_POLICY: '/privacy-policy',
  REFUND_POLICY: '/refund-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  
  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    RESET_PASSWORD: '/reset-password',
  },
  
  // Menu routes
  MENU: {
    VIEW: (slug: string) => `/menu/${slug}`,
    PREVIEW: (slug: string) => `/menu/${slug}/preview`,
    CREATE: '/menu/create',
    MANAGE: (slug: string) => `/menu/manage/${slug}`,
    QR_MENU: (slug: string) => `/menu/manage/${slug}/qr-menu`,
  },
  
  // API routes
  API: {
    TRPC: '/api/trpc',
    SENTRY_EXAMPLE: '/api/sentry-example-api',
  },
} as const;

/**
 * Route metadata for documentation and testing
 */
export const ROUTE_METADATA = {
  [APP_ROUTES.HOME]: {
    name: 'Home',
    description: 'Landing page',
    protected: false,
  },
  [APP_ROUTES.AUTH.LOGIN]: {
    name: 'Login',
    description: 'User login page',
    protected: false,
  },
  [APP_ROUTES.AUTH.REGISTER]: {
    name: 'Register',
    description: 'User registration page',
    protected: false,
  },
  [APP_ROUTES.MENU.CREATE]: {
    name: 'Create Menu',
    description: 'Create a new menu',
    protected: true,
  },
} as const;

/**
 * Get all public routes
 */
export const getPublicRoutes = () => [
  APP_ROUTES.HOME,
  APP_ROUTES.AUTH.LOGIN,
  APP_ROUTES.AUTH.REGISTER,
  APP_ROUTES.PRIVACY_POLICY,
  APP_ROUTES.REFUND_POLICY,
  APP_ROUTES.TERMS_OF_SERVICE,
];

/**
 * Check if a route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = getPublicRoutes();
  // Check for exact match or /menu/[slug] pattern (public menu view)
  return publicRoutes.some(route => pathname === route) || 
         (pathname.startsWith('/menu/') && !pathname.includes('/create') && !pathname.includes('/manage'));
};

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return pathname.startsWith('/menu/create') || 
         pathname.startsWith('/menu/manage');
};
