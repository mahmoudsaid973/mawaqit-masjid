import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { prayerTimes, NewPrayerTime } from '@/db/schema/prayer-times';
import { logger } from '@/lib/logger';

/**
 * Filter options for retrieving prayer times
 */
export interface PrayerTimesFilter {
  city?: string;
  country?: string;
  date?: Date;
  latitude?: number;
  longitude?: number;
  limit?: number;
}

/**
 * Data transfer object for creating a prayer time record
 */
export interface CreatePrayerTimeDTO {
  city: string;
  country: string;
  fajr: Date;
  sunrise?: Date | null;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  date: Date;
  timezone: string;
  latitude: number;
  longitude: number;
  calculationMethod?: string | null;
  juristicMethod?: string | null;
}

/**
 * Data transfer object for updating a prayer time record
 */
export interface UpdatePrayerTimeDTO {
  city?: string;
  country?: string;
  fajr?: Date;
  sunrise?: Date | null;
  dhuhr?: Date;
  asr?: Date;
  maghrib?: Date;
  isha?: Date;
  date?: Date;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  calculationMethod?: string | null;
  juristicMethod?: string | null;
}

/**
 * Custom error class for prayer times service operations
 */
export class PrayerTimesServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'PrayerTimesServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Service layer for Prayer Times operations
 * Handles business logic and database interactions
 */
export class PrayerTimesService {
  /**
   * Retrieve prayer times with optional filters
   * @param filters - Filter criteria for querying
   * @returns Array of prayer time records
   * @throws PrayerTimesServiceError on failure
   */
  async getPrayerTimes(filters: PrayerTimesFilter): Promise<typeof prayerTimes.$inferSelect[]> {
    try {
      const { city, country, date, latitude, longitude, limit = 10 } = filters;
      const conditions = [];

      if (city) {
        conditions.push(eq(prayerTimes.city, city));
      }

      if (country) {
        conditions.push(eq(prayerTimes.country, country));
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(and(gte(prayerTimes.date, startOfDay), lte(prayerTimes.date, endOfDay)));
      }

      if (latitude !== undefined && longitude !== undefined) {
        // Simplified proximity search - rounds coordinates for matching
        // Production should use PostGIS for accurate geospatial queries
        conditions.push(eq(prayerTimes.latitude, Math.round(latitude)));
        conditions.push(eq(prayerTimes.longitude, Math.round(longitude)));
      }

      const results = await db
        .select()
        .from(prayerTimes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(prayerTimes.date))
        .limit(limit);

      logger.info('Prayer times retrieved via service', {
        count: results.length,
        filters: { city, country, date, latitude, longitude },
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Service failed to retrieve prayer times', { error: errorMessage });
      throw new PrayerTimesServiceError(
        'RETRIEVE_FAILED',
        'Failed to retrieve prayer times',
        500
      );
    }
  }

  /**
   * Create a new prayer time record
   * @param data - Prayer time data to insert
   * @returns The created prayer time record
   * @throws PrayerTimesServiceError on failure
   */
  async createPrayerTime(data: CreatePrayerTimeDTO): Promise<typeof prayerTimes.$inferSelect> {
    try {
      const inserted = await db
        .insert(prayerTimes)
        .values({
          city: data.city,
          country: data.country,
          fajr: data.fajr,
          sunrise: data.sunrise ?? null,
          dhuhr: data.dhuhr,
          asr: data.asr,
          maghrib: data.maghrib,
          isha: data.isha,
          date: data.date,
          timezone: data.timezone,
          latitude: data.latitude,
          longitude: data.longitude,
          calculationMethod: data.calculationMethod ?? null,
          juristicMethod: data.juristicMethod ?? null,
        })
        .returning();

      const result = inserted[0];
      if (!result) {
        throw new PrayerTimesServiceError(
          'INSERT_FAILED',
          'No record returned after insertion',
          500
        );
      }

      logger.info('Prayer time created via service', {
        id: result.id,
        city: result.city,
        country: result.country,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Service failed to create prayer time', { error: errorMessage });
      
      if (error instanceof PrayerTimesServiceError) {
        throw error;
      }
      
      throw new PrayerTimesServiceError(
        'CREATE_FAILED',
        'Failed to create prayer time',
        500
      );
    }
  }

  /**
   * Update an existing prayer time record
   * @param id - ID of the prayer time to update
   * @param data - Fields to update
   * @returns The updated prayer time record
   * @throws PrayerTimesServiceError if not found or update fails
   */
  async updatePrayerTime(
    id: string,
    data: UpdatePrayerTimeDTO
  ): Promise<typeof prayerTimes.$inferSelect> {
    try {
      const updateValues: Partial<NewPrayerTime> = {};

      if (data.city !== undefined) updateValues.city = data.city;
      if (data.country !== undefined) updateValues.country = data.country;
      if (data.fajr !== undefined) updateValues.fajr = data.fajr;
      if (data.sunrise !== undefined) updateValues.sunrise = data.sunrise;
      if (data.dhuhr !== undefined) updateValues.dhuhr = data.dhuhr;
      if (data.asr !== undefined) updateValues.asr = data.asr;
      if (data.maghrib !== undefined) updateValues.maghrib = data.maghrib;
      if (data.isha !== undefined) updateValues.isha = data.isha;
      if (data.date !== undefined) updateValues.date = data.date;
      if (data.timezone !== undefined) updateValues.timezone = data.timezone;
      if (data.latitude !== undefined) updateValues.latitude = data.latitude;
      if (data.longitude !== undefined) updateValues.longitude = data.longitude;
      if (data.calculationMethod !== undefined) updateValues.calculationMethod = data.calculationMethod;
      if (data.juristicMethod !== undefined) updateValues.juristicMethod = data.juristicMethod;

      const updated = await db
        .update(prayerTimes)
        .set(updateValues)
        .where(eq(prayerTimes.id, id))
        .returning();

      if (updated.length === 0) {
        throw new PrayerTimesServiceError(
          'NOT_FOUND',
          'Prayer time not found',
          404
        );
      }

      logger.info('Prayer time updated via service', {
        id,
        updates: Object.keys(updateValues),
      });

      return updated[0];
    } catch (error) {
      if (error instanceof PrayerTimesServiceError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Service failed to update prayer time', { error: errorMessage, id });
      
      throw new PrayerTimesServiceError(
        'UPDATE_FAILED',
        'Failed to update prayer time',
        500
      );
    }
  }

  /**
   * Delete a prayer time record
   * @param id - ID of the prayer time to delete
   * @returns The deleted prayer time record
   * @throws PrayerTimesServiceError if not found or deletion fails
   */
  async deletePrayerTime(id: string): Promise<typeof prayerTimes.$inferSelect> {
    try {
      const deleted = await db
        .delete(prayerTimes)
        .where(eq(prayerTimes.id, id))
        .returning();

      if (deleted.length === 0) {
        throw new PrayerTimesServiceError(
          'NOT_FOUND',
          'Prayer time not found',
          404
        );
      }

      logger.info('Prayer time deleted via service', { id });

      return deleted[0];
    } catch (error) {
      if (error instanceof PrayerTimesServiceError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Service failed to delete prayer time', { error: errorMessage, id });
      
      throw new PrayerTimesServiceError(
        'DELETE_FAILED',
        'Failed to delete prayer time',
        500
      );
    }
  }

  /**
   * Get prayer times for a specific date range
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @param city - Optional city filter
   * @param country - Optional country filter
   * @returns Array of prayer time records within the date range
   */
  async getPrayerTimesByDateRange(
    startDate: Date,
    endDate: Date,
    city?: string,
    country?: string
  ): Promise<typeof prayerTimes.$inferSelect[]> {
    try {
      const conditions = [
        gte(prayerTimes.date, startDate),
        lte(prayerTimes.date, endDate),
      ];

      if (city) {
        conditions.push(eq(prayerTimes.city, city));
      }

      if (country) {
        conditions.push(eq(prayerTimes.country, country));
      }

      const results = await db
        .select()
        .from(prayerTimes)
        .where(and(...conditions))
        .orderBy(desc(prayerTimes.date));

      logger.info('Prayer times retrieved by date range', {
        count: results.length,
        startDate,
        endDate,
        city,
        country,
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Service failed to retrieve prayer times by date range', { error: errorMessage });
      
      throw new PrayerTimesServiceError(
        'DATE_RANGE_QUERY_FAILED',
        'Failed to retrieve prayer times for date range',
        500
      );
    }
  }
}

// Export singleton instance for dependency injection
export const prayerTimesService = new PrayerTimesService();
