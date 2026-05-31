import { eq } from 'drizzle-orm';
import { drizzleClient } from '@/db/client';
import { azkarTable, type Azkar, type NewAzkar, type UpdateAzkar } from '@/db/schema/azkar';

/**
 * Custom error class for Azkar service operations.
 * Ensures structured error responses with machine-readable codes.
 */
export class AzkarServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'AzkarServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Retrieves a list of Azkar entries.
 * @param favoriteFilter - Optional filter for favorite status ('true' | 'false').
 * @returns Promise resolving to an array of Azkar entries.
 */
export async function getAllAzkar(favoriteFilter?: 'true' | 'false'): Promise<Azkar[]> {
  try {
    let query = drizzleClient.select().from(azkarTable);

    if (favoriteFilter === 'true') {
      query = query.where(eq(azkarTable.isFavorite, true));
    } else if (favoriteFilter === 'false') {
      query = query.where(eq(azkarTable.isFavorite, false));
    }

    return await query;
  } catch (error) {
    if (error instanceof AzkarServiceError) {
      throw error;
    }
    throw new AzkarServiceError(
      'Failed to retrieve Azkar list',
      'DATABASE_QUERY_FAILED',
      500
    );
  }
}

/**
 * Retrieves a single Azkar entry by ID.
 * @param id - The numeric ID of the Azkar entry.
 * @returns Promise resolving to the Azkar entry.
 * @throws AzkarServiceError if not found.
 */
export async function getAzkarById(id: number): Promise<Azkar> {
  try {
    const results = await drizzleClient
      .select()
      .from(azkarTable)
      .where(eq(azkarTable.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new AzkarServiceError('Azkar not found', 'NOT_FOUND', 404);
    }

    return results[0];
  } catch (error) {
    if (error instanceof AzkarServiceError) {
      throw error;
    }
    throw new AzkarServiceError(
      `Failed to retrieve Azkar with ID ${id}`,
      'DATABASE_QUERY_FAILED',
      500
    );
  }
}

/**
 * Creates a new Azkar entry.
 * @param data - The data for the new Azkar entry.
 * @returns Promise resolving to the created Azkar entry.
 */
export async function createAzkar(data: NewAzkar): Promise<Azkar> {
  try {
    const [newEntry] = await drizzleClient
      .insert(azkarTable)
      .values(data)
      .returning();

    if (!newEntry) {
      throw new AzkarServiceError(
        'Failed to create Azkar entry',
        'CREATION_FAILED',
        500
      );
    }

    return newEntry;
  } catch (error) {
    if (error instanceof AzkarServiceError) {
      throw error;
    }
    throw new AzkarServiceError(
      'Failed to create Azkar entry',
      'DATABASE_INSERT_FAILED',
      500
    );
  }
}

/**
 * Updates an existing Azkar entry.
 * @param id - The numeric ID of the Azkar entry to update.
 * @param data - The partial data to update.
 * @returns Promise resolving to the updated Azkar entry.
 * @throws AzkarServiceError if not found.
 */
export async function updateAzkar(id: number, data: UpdateAzkar): Promise<Azkar> {
  try {
    const updated = await drizzleClient
      .update(azkarTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(azkarTable.id, id))
      .returning();

    if (updated.length === 0) {
      throw new AzkarServiceError('Azkar not found', 'NOT_FOUND', 404);
    }

    return updated[0];
  } catch (error) {
    if (error instanceof AzkarServiceError) {
      throw error;
    }
    throw new AzkarServiceError(
      `Failed to update Azkar with ID ${id}`,
      'DATABASE_UPDATE_FAILED',
      500
    );
  }
}

/**
 * Deletes an Azkar entry.
 * @param id - The numeric ID of the Azkar entry to delete.
 * @throws AzkarServiceError if not found.
 */
export async function deleteAzkar(id: number): Promise<void> {
  try {
    const deleted = await drizzleClient
      .delete(azkarTable)
      .where(eq(azkarTable.id, id))
      .returning();

    if (deleted.length === 0) {
      throw new AzkarServiceError('Azkar not found', 'NOT_FOUND', 404);
    }
  } catch (error) {
    if (error instanceof AzkarServiceError) {
      throw error;
    }
    throw new AzkarServiceError(
      `Failed to delete Azkar with ID ${id}`,
      'DATABASE_DELETE_FAILED',
      500
    );
  }
}