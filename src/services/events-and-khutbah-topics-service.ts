import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { eventsTable, khutbahTopicsTable, eventStatusEnum, khutbahTopicStatusEnum } from '@/db/schema/events-and-khutbah-topics';
import { Event, KhutbahTopic } from '@/models/events-and-khutbah-topics-model';

/**
 * Service layer for Events and Khutbah Topics.
 * Handles business logic and database interactions.
 */

export interface GetEventsFilter {
  status?: typeof eventStatusEnum.enumValues[number];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface GetKhutbahTopicsFilter {
  status?: typeof khutbahTopicStatusEnum.enumValues[number];
  language?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetches events based on provided filters.
 * @param filter - Filtering criteria including status, date range, pagination.
 * @returns Promise resolving to an array of Event objects.
 */
export async function getEvents(filter: GetEventsFilter): Promise<Event[]> {
  const { status, startDate, endDate, limit = 50, offset = 0 } = filter;

  const conditions = [];

  if (status) {
    conditions.push(eq(eventsTable.status, status));
  }

  if (startDate) {
    conditions.push(gte(eventsTable.startTime, new Date(startDate)));
  }

  if (endDate) {
    conditions.push(lte(eventsTable.endTime, new Date(endDate)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(eventsTable)
    .where(whereClause)
    .orderBy(desc(eventsTable.startTime))
    .limit(limit)
    .offset(offset);

  return results as unknown as Event[];
}

/**
 * Fetches khutbah topics based on provided filters.
 * @param filter - Filtering criteria including status, language, pagination.
 * @returns Promise resolving to an array of KhutbahTopic objects.
 */
export async function getKhutbahTopics(filter: GetKhutbahTopicsFilter): Promise<KhutbahTopic[]> {
  const { status, language, limit = 50, offset = 0 } = filter;

  const conditions = [];

  if (status) {
    conditions.push(eq(khutbahTopicsTable.status, status));
  }

  if (language) {
    conditions.push(eq(khutbahTopicsTable.language, language));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(khutbahTopicsTable)
    .where(whereClause)
    .orderBy(desc(khutbahTopicsTable.createdAt))
    .limit(limit)
    .offset(offset);

  return results as unknown as KhutbahTopic[];
}
