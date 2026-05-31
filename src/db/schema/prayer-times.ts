import { pgTable, uuid, integer, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

/**
 * Prayer times table schema definition
 * Contains the structure for storing prayer time records with geographic and timing details
 */
export const prayerTimes = pgTable('prayer_times', {
  id: uuid('id').defaultRandom().primaryKey(),
 
  /** The geographical city name associated with these prayer times */
  city: text('city').notNull(),
  
  /** The timestamp for Fajr (dawn) prayer */
  fajr: timestamp('fajr').notNull(),
  
  /** The timestamp for Sunrise prayer */
  sunrise: timestamp('sunrise'),
  
  /** The timestamp for Dhuhr (noon) prayer */
  dhuhr: timestamp('dhuhr').notNull(),
  
  /** The timestamp for Asr (afternoon) prayer */
  asr: timestamp('asr').notNull(),
  
  /** The timestamp for Maghrib (sunset) prayer */
  maghrib: timestamp('maghrib').notNull(),
  
  /** The timestamp for Isha (night) prayer */
  isha: timestamp('isha').notNull(),
  
  /** The date for which these prayer times are calculated */
  date: timestamp('date').notNull(),
  
  /** Timezone information for the location */
  timezone: text('timezone').notNull(),
  
  /** The associated country */
  country: text('country').notNull(),
  
  /** The associated latitude for the location */
  latitude: doublePrecision('latitude').notNull(),
  
  /** The associated longitude for the location */
  longitude: doublePrecision('longitude').notNull(),
  
  /** The associated calculation method used for the timings */
  calculationMethod: text('calculation_method'),
  
  /** The associated juristic method for calculation */
  juristicMethod: text('juristic_method'),
  
  /** The associated timestamp of the last update */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  /** The associated creation timestamp */
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NewPrayerTime = Record<string, unknown>; // Wave15: contract backfill
