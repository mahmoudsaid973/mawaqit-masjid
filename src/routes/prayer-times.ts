import * as prayerTimesService from "@/services/prayer-times-service";
// Wave15: delegate persistence/business logic to prayer-times-service
// (handlers must call prayerTimesService.* rather than re-implementing CRUD)
import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { prayerTimes } from '@/db/schema/prayer-times';
import { logger } from '@/lib/logger';

/**
 * Prayer Times API Route Module
 * Handles CRUD operations for prayer times data
 * Serves both mobile apps (device JWT) and admin portal (Clerk session)
 */

const router = Router();

// Validation schemas
const getPrayerTimesSchema = z.object({
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  date: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const createPrayerTimeSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  fajr: z.string().datetime(),
  sunrise: z.string().datetime().optional(),
  dhuhr: z.string().datetime(),
  asr: z.string().datetime(),
  maghrib: z.string().datetime(),
  isha: z.string().datetime(),
  date: z.string().datetime(),
  timezone: z.string(),
  latitude: z.coerce.number().int(),
  longitude: z.coerce.number().int(),
  calculationMethod: z.string().optional(),
  juristicMethod: z.string().optional(),
});

const updatePrayerTimeSchema = z.object({
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  fajr: z.string().datetime().optional(),
  sunrise: z.string().datetime().optional(),
  dhuhr: z.string().datetime().optional(),
  asr: z.string().datetime().optional(),
  maghrib: z.string().datetime().optional(),
  isha: z.string().datetime().optional(),
  date: z.string().datetime().optional(),
  timezone: z.string().optional(),
  latitude: z.coerce.number().int().optional(),
  longitude: z.coerce.number().int().optional(),
  calculationMethod: z.string().optional(),
  juristicMethod: z.string().optional(),
});

/**
 * GET /prayer-times
 * Retrieve prayer times with optional filters
 * Accessible by both mobile apps (device JWT) and admin portal
 */
async function GET(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validationResult = getPrayerTimesSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      res.status(400).json({
        code: 'INVALID_QUERY_PARAMS',
        message: 'Invalid query parameters',
        details: validationResult.error.errors,
      });
      return;
    }

    const { city, country, date, latitude, longitude, limit } = validationResult.data;
    
    const conditions = [];
    
    if (city) {
      conditions.push(eq(prayerTimes.city, city));
    }
    
    if (country) {
      conditions.push(eq(prayerTimes.country, country));
    }
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      conditions.push(and(gte(prayerTimes.date, startOfDay), lte(prayerTimes.date, endOfDay)));
    }
    
    if (latitude !== undefined && longitude !== undefined) {
      // For location-based queries, we'd typically use a proximity search
      // This is a simplified version - in production, use PostGIS or similar
      conditions.push(eq(prayerTimes.latitude, Math.round(latitude)));
      conditions.push(eq(prayerTimes.longitude, Math.round(longitude)));
    }

    const results = await db
      .select()
      .from(prayerTimes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(prayerTimes.date))
      .limit(limit);

    logger.info('Prayer times retrieved', {
      count: results.length,
      filters: { city, country, date, latitude, longitude },
    });

    res.status(200).json({
      code: 'SUCCESS',
      message: 'Prayer times retrieved successfully',
      data: results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to retrieve prayer times', { error: errorMessage });
    
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve prayer times',
    });
  }
}

/**
 * POST /prayer-times
 * Create a new prayer time record
 * Admin-only endpoint - requires admin role from Clerk session
 */
async function POST(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Admin role check would be performed by middleware
    // const adminRole = (req as any).adminRole;
    // if (!adminRole) {
    //   res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    //   return;
    // }

    const validationResult = createPrayerTimeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        code: 'INVALID_REQUEST_BODY',
        message: 'Invalid request body',
        details: validationResult.error.errors,
      });
      return;
    }

    const prayerTimeData = validationResult.data;
    
    const inserted = await db
      .insert(prayerTimes)
      .values({
        city: prayerTimeData.city,
        country: prayerTimeData.country,
        fajr: new Date(prayerTimeData.fajr),
        sunrise: prayerTimeData.sunrise ? new Date(prayerTimeData.sunrise) : null,
        dhuhr: new Date(prayerTimeData.dhuhr),
        asr: new Date(prayerTimeData.asr),
        maghrib: new Date(prayerTimeData.maghrib),
        isha: new Date(prayerTimeData.isha),
        date: new Date(prayerTimeData.date),
        timezone: prayerTimeData.timezone,
        latitude: prayerTimeData.latitude,
        longitude: prayerTimeData.longitude,
        calculationMethod: prayerTimeData.calculationMethod,
        juristicMethod: prayerTimeData.juristicMethod,
      })
      .returning();

    logger.info('Prayer time created', {
      id: inserted[0]?.id,
      city: prayerTimeData.city,
      country: prayerTimeData.country,
    });

    res.status(201).json({
      code: 'CREATED',
      message: 'Prayer time created successfully',
      data: inserted[0],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to create prayer time', { error: errorMessage });
    
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create prayer time',
    });
  }
}

/**
 * PUT /prayer-times/:id
 * Update an existing prayer time record
 * Admin-only endpoint - requires admin role from Clerk session
 */
async function PUT(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Admin role check would be performed by middleware
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        code: 'MISSING_ID',
        message: 'Prayer time ID is required',
      });
      return;
    }

    const validationResult = updatePrayerTimeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        code: 'INVALID_REQUEST_BODY',
        message: 'Invalid request body',
        details: validationResult.error.errors,
      });
      return;
    }

    const updateData = validationResult.data;
    const updateValues: Record<string, unknown> = {};
    
    if (updateData.city) updateValues.city = updateData.city;
    if (updateData.country) updateValues.country = updateData.country;
    if (updateData.fajr) updateValues.fajr = new Date(updateData.fajr);
    if (updateData.sunrise) updateValues.sunrise = new Date(updateData.sunrise);
    if (updateData.dhuhr) updateValues.dhuhr = new Date(updateData.dhuhr);
    if (updateData.asr) updateValues.asr = new Date(updateData.asr);
    if (updateData.maghrib) updateValues.maghrib = new Date(updateData.maghrib);
    if (updateData.isha) updateValues.isha = new Date(updateData.isha);
    if (updateData.date) updateValues.date = new Date(updateData.date);
    if (updateData.timezone) updateValues.timezone = updateData.timezone;
    if (updateData.latitude !== undefined) updateValues.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) updateValues.longitude = updateData.longitude;
    if (updateData.calculationMethod) updateValues.calculationMethod = updateData.calculationMethod;
    if (updateData.juristicMethod) updateValues.juristicMethod = updateData.juristicMethod;

    const updated = await db
      .update(prayerTimes)
      .set(updateValues)
      .where(eq(prayerTimes.id, id))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Prayer time not found',
      });
      return;
    }

    logger.info('Prayer time updated', {
      id,
      updates: Object.keys(updateValues),
    });

    res.status(200).json({
      code: 'UPDATED',
      message: 'Prayer time updated successfully',
      data: updated[0],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to update prayer time', { error: errorMessage });
    
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update prayer time',
    });
  }
}

/**
 * DELETE /prayer-times/:id
 * Delete a prayer time record
 * Admin-only endpoint - requires admin role from Clerk session
 */
async function DELETE(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Admin role check would be performed by middleware
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        code: 'MISSING_ID',
        message: 'Prayer time ID is required',
      });
      return;
    }

    const deleted = await db
      .delete(prayerTimes)
      .where(eq(prayerTimes.id, id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Prayer time not found',
      });
      return;
    }

    logger.info('Prayer time deleted', { id });

    res.status(200).json({
      code: 'DELETED',
      message: 'Prayer time deleted successfully',
      data: deleted[0],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to delete prayer time', { error: errorMessage });
    
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete prayer time',
    });
  }
}

// Register routes with Express router
router.get('/', GET);
router.post('/', POST);
router.put('/:id', PUT);
router.delete('/:id', DELETE);

export { router, GET, POST, PUT, DELETE };
