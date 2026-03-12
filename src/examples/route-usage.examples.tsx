/**
 * Example Usage of Centralized Routes
 * 
 * This file demonstrates how to use the centralized route configuration
 * throughout your application.
 */

import { APP_ROUTES, isPublicRoute, isProtectedRoute } from '~/config/routes.config';
import { useRouter } from 'next/navigation';

// ============================================================================
// Example 1: Basic Navigation
// ============================================================================

export function NavigationExample() {
  const router = useRouter();

  const handleLogin = () => {
    // ❌ Old way - hardcoded string
    // router.push('/login');

    // ✅ New way - centralized route
    router.push(APP_ROUTES.AUTH.LOGIN);
  };

  const handleCreateMenu = () => {
    // ✅ Type-safe route
    router.push(APP_ROUTES.MENU.CREATE);
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleCreateMenu}>Create Menu</button>
    </div>
  );
}

// ============================================================================
// Example 2: Dynamic Routes
// ============================================================================

export function DynamicRouteExample({ menuSlug }: { menuSlug: string }) {
  const router = useRouter();

  const viewMenu = () => {
    // ❌ Old way
    // router.push(`/menu/${menuSlug}`);

    // ✅ New way - type-safe dynamic route
    router.push(APP_ROUTES.MENU.VIEW(menuSlug));
  };

  const previewMenu = () => {
    router.push(APP_ROUTES.MENU.PREVIEW(menuSlug));
  };

  const manageMenu = () => {
    router.push(APP_ROUTES.MENU.MANAGE(menuSlug));
  };

  return (
    <div>
      <button onClick={viewMenu}>View Menu</button>
      <button onClick={previewMenu}>Preview Menu</button>
      <button onClick={manageMenu}>Manage Menu</button>
    </div>
  );
}

// ============================================================================
// Example 3: Route Protection Check
// ============================================================================

export function RouteProtectionExample() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    // Check if route requires authentication
    if (isProtectedRoute(path)) {
      // Check authentication status
      const isAuthenticated = checkAuth(); // your auth logic

      if (!isAuthenticated) {
        // Redirect to login
        router.push(APP_ROUTES.AUTH.LOGIN);

        return;
      }
    }

    router.push(path);
  };

  return (
    <div>
      <button onClick={() => navigateTo(APP_ROUTES.MENU.CREATE)}>
        Create Menu (Protected)
      </button>
      <button onClick={() => navigateTo(APP_ROUTES.HOME)}>
        Home (Public)
      </button>
    </div>
  );
}

// ============================================================================
// Example 4: Link Component Usage
// ============================================================================

export function LinkExample({ menuSlug }: { menuSlug: string }) {
  return (
    <nav>
      {/* ❌ Old way */}
      {/* <Link href="/menu/create">Create Menu</Link> */}

      {/* ✅ New way */}
      <Link href={APP_ROUTES.MENU.CREATE}>Create Menu</Link>
      <Link href={APP_ROUTES.MENU.VIEW(menuSlug)}>View Menu</Link>
      <Link href={APP_ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>
    </nav>
  );
}

// ============================================================================
// Example 5: Middleware Usage
// ============================================================================

export function checkAuth() {
  // Your authentication logic
  return true;
}

export async function customMiddleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if route is public
  if (isPublicRoute(pathname)) {
    return; // Allow access
  }

  // Check if route requires protection
  if (isProtectedRoute(pathname)) {
    const isAuthenticated = checkAuth();
    
    if (!isAuthenticated) {
      // Redirect to login
      return Response.redirect(new URL(APP_ROUTES.AUTH.LOGIN, request.url));
    }
  }
}

// ============================================================================
// Example 6: API Route Usage
// ============================================================================

export async function fetchMenus() {
  // ❌ Old way
  // const response = await fetch('/api/trpc/menus.getAll');

  // ✅ New way
  const response = await fetch(APP_ROUTES.API.TRPC);

  return response.json();
}

// ============================================================================
// Example 7: Breadcrumb Generation
// ============================================================================

interface Breadcrumb {
  label: string;
  href: string;
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: APP_ROUTES.HOME }
  ];

  if (pathname.startsWith('/menu/')) {
    breadcrumbs.push({ label: 'Menus', href: APP_ROUTES.MENU.CREATE });
    
    // Extract slug from pathname
    const slug = pathname.split('/')[2];

    if (slug && slug !== 'create') {
      breadcrumbs.push({ 
        label: 'View Menu', 
        href: APP_ROUTES.MENU.VIEW(slug) 
      });
    }
  }

  return breadcrumbs;
}

// ============================================================================
// Example 8: Menu Navigation Component
// ============================================================================

export function MenuNavigation({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <nav className="flex gap-4">
      <Link href={APP_ROUTES.HOME}>Home</Link>
      
      {isAuthenticated ? (
        <>
          <Link href={APP_ROUTES.MENU.CREATE}>Create Menu</Link>
          {/* Other authenticated routes */}
        </>
      ) : (
        <>
          <Link href={APP_ROUTES.AUTH.LOGIN}>Login</Link>
          <Link href={APP_ROUTES.AUTH.REGISTER}>Register</Link>
        </>
      )}
      
      <Link href={APP_ROUTES.PRIVACY_POLICY}>Privacy</Link>
      <Link href={APP_ROUTES.TERMS_OF_SERVICE}>Terms</Link>
    </nav>
  );
}

// ============================================================================
// Example 9: Form Redirect After Success
// ============================================================================

export function CreateMenuForm() {
  const router = useRouter();

  const handleSubmit = async (data: unknown) => {
    const result = await createMenu(data);
    
    if (result.success) {
      // Redirect to the new menu's management page
      router.push(APP_ROUTES.MENU.MANAGE(result.menuSlug));
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}

// ============================================================================
// Example 10: Route Constants in Tests
// ============================================================================

import { describe, it, expect } from 'vitest';

describe('Navigation Tests', () => {
  it('should navigate to correct menu page', () => {
    const menuSlug = 'test-restaurant-123';
    const expectedUrl = '/menu/test-restaurant-123';
    
    // ✅ Type-safe and consistent
    expect(APP_ROUTES.MENU.VIEW(menuSlug)).toBe(expectedUrl);
  });

  it('should identify protected routes', () => {
    expect(isProtectedRoute(APP_ROUTES.MENU.CREATE)).toBe(true);
    expect(isProtectedRoute(APP_ROUTES.HOME)).toBe(false);
  });
});

// ============================================================================
// Dummy imports and helpers
// ============================================================================

import Link from 'next/link';

async function createMenu(_data: unknown) {
  return { success: true, menuSlug: 'test-menu' };
}
