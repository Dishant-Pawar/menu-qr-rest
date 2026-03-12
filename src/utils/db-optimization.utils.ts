/**
 * Database Query Optimization Utilities
 * 
 * Helpers for optimizing database queries, caching, and performance monitoring.
 */

import { type PrismaClient } from '@prisma/client';

/**
 * Query cache configuration
 */
const CACHE_TTL = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
} as const;

/**
 * Simple in-memory cache
 * In production, replace with Redis or similar
 */
class QueryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): any | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) return undefined;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return cached.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => queryCache.cleanup(), 5 * 60 * 1000);
}

/**
 * Cached query wrapper
 */
export const cachedQuery = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> => {
  const cached = queryCache.get(key);
  
  if (cached !== undefined) {
    return cached as T;
  }
  
  const result = await queryFn();
  queryCache.set(key, result, ttl);
  
  return result;
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCachePattern = (pattern: string): void => {
  const cache = (queryCache as any).cache;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Optimized menu query with selective fields
 */
export const getMenuOptimized = async (
  db: PrismaClient,
  slug: string,
  includeUnpublished: boolean = false
) => {
  const cacheKey = `menu:${slug}:${includeUnpublished}`;
  
  return cachedQuery(
    cacheKey,
    () => db.menus.findFirst({
      where: {
        slug,
        ...(includeUnpublished ? {} : { isPublished: true }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        contactNumber: true,
        backgroundImageUrl: true,
        logoImageUrl: true,
        isPublished: true,
        facebookUrl: true,
        googleReviewUrl: true,
        instagramUrl: true,
        userId: true,
        // Use select instead of include for better performance
        dishes: {
          select: {
            id: true,
            price: true,
            pictureUrl: true,
            categoryId: true,
            dishesTranslation: {
              select: {
                name: true,
                description: true,
                languageId: true,
              },
            },
            dishVariants: {
              select: {
                id: true,
                price: true,
                variantTranslations: {
                  select: {
                    name: true,
                    description: true,
                    languageId: true,
                  },
                },
              },
            },
          },
        },
        categories: {
          select: {
            id: true,
            categoriesTranslation: {
              select: {
                name: true,
                languageId: true,
              },
            },
          },
        },
        menuLanguages: {
          select: {
            languageId: true,
            isDefault: true,
            languages: {
              select: {
                id: true,
                name: true,
                isoCode: true,
                flagUrl: true,
              },
            },
          },
        },
      },
    }),
    CACHE_TTL.MEDIUM
  );
};

/**
 * Batch load dishes by IDs to prevent N+1 queries
 */
export const batchLoadDishes = async (
  db: PrismaClient,
  dishIds: string[]
) => {
  if (dishIds.length === 0) return [];
  
  return db.dishes.findMany({
    where: {
      id: { in: dishIds },
    },
    select: {
      id: true,
      price: true,
      pictureUrl: true,
      dishesTranslation: true,
    },
  });
};

/**
 * Get user menus with pagination
 */
export const getUserMenusPaginated = async (
  db: PrismaClient,
  userId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const skip = (page - 1) * pageSize;
  
  const [menus, total] = await Promise.all([
    db.menus.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        isPublished: true,
        logoImageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            dishes: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.menus.count({ where: { userId } }),
  ]);
  
  return {
    menus,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * Database query performance monitoring
 */
export const monitorQuery = async <T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`[DB SLOW QUERY] ${name} took ${duration.toFixed(2)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[DB QUERY] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[DB ERROR] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Bulk insert with batching to prevent memory issues
 */
export const bulkInsertBatched = async <T>(
  items: T[],
  batchSize: number,
  insertFn: (batch: T[]) => Promise<void>
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await insertFn(batch);
  }
};

/**
 * Optimized count query
 */
export const getOptimizedCount = async (
  db: PrismaClient,
  tableName: string,
  where: any
): Promise<number> => {
  // Use _count for better performance
  const table = (db as any)[tableName];
  if (!table) throw new Error(`Table ${tableName} not found`);
  
  return table.count({ where });
};

/**
 * Database connection pool monitoring
 */
export const checkDatabaseHealth = async (db: PrismaClient): Promise<{
  healthy: boolean;
  latency: number;
}> => {
  const start = performance.now();
  
  try {
    await db.$queryRaw`SELECT 1`;
    const latency = performance.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    console.error('[DB HEALTH CHECK FAILED]', error);
    return {
      healthy: false,
      latency: -1,
    };
  }
};

/**
 * Generate cache key from parameters
 */
export const generateCacheKey = (
  prefix: string,
  params: Record<string, any>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
};

/**
 * Preload related data to avoid N+1 queries
 */
export const preloadMenuRelations = async (
  db: PrismaClient,
  menuId: string
) => {
  // Fetch all related data in parallel
  const [dishes, categories, languages] = await Promise.all([
    db.dishes.findMany({
      where: { menuId },
      include: {
        dishesTranslation: true,
        dishVariants: {
          include: { variantTranslations: true },
        },
      },
    }),
    db.categories.findMany({
      where: { menuId },
      include: { categoriesTranslation: true },
    }),
    db.menuLanguages.findMany({
      where: { menuId },
      include: { languages: true },
    }),
  ]);
  
  return { dishes, categories, languages };
};

export { CACHE_TTL };
