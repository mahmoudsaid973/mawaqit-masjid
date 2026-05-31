import { eq, and, desc, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { adminOperators } from '@/db/schema/admin-portal';
import { logger } from '@/lib/logger';

export interface Operator {
  id: string;
  clerkId: string;
  email: string;
  fullName: string | null;
  role: 'support' | 'admin' | 'super_admin';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deletedAt: Date | null;
}

export async function listActiveOperators(limit: number, offset: number): Promise<Operator[]> {
  try {
    const operators = await db
      .select()
      .from(adminOperators)
      .where(and(isNull(adminOperators.deletedAt), eq(adminOperators.isActive, true)))
      .orderBy(desc(adminOperators.createdAt))
      .limit(limit)
      .offset(offset);

    return operators as unknown as Operator[];
  } catch (error) {
    logger.error({ error }, 'Failed to list active operators');
    throw error;
  }
}

export async function createOperator(
  clerkId: string,
  email: string,
  fullName: string | undefined,
  role: 'support' | 'admin' | 'super_admin'
): Promise<Operator> {
  try {
    const [newOperator] = await db
      .insert(adminOperators)
      .values({
        clerkId,
        email,
        fullName: fullName ?? null,
        role,
      })
      .returning();

    if (!newOperator) {
      throw new Error('Failed to create operator');
    }

    return newOperator as unknown as Operator;
  } catch (error) {
    logger.error({ error, clerkId, email, fullName, role }, 'Failed to create operator');
    throw error;
  }
}

export async function updateOperator(
  id: string,
  updates: Partial<Pick<Operator, 'role' | 'fullName' | 'isActive'>>
): Promise<Operator | null> {
  try {
    const [updated] = await db
      .update(adminOperators)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(adminOperators.id, id))
      .returning();

    return (updated as unknown as Operator) || null;
  } catch (error) {
    logger.error({ error, id, updates }, 'Failed to update operator');
    throw error;
  }
}

export async function findOperatorById(id: string): Promise<Operator | null> {
  try {
    const [operator] = await db
      .select()
      .from(adminOperators)
      .where(eq(adminOperators.id, id));

    return (operator as unknown as Operator) || null;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find operator by ID');
    throw error;
  }
}