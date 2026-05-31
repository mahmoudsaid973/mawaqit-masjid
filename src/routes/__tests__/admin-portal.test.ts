// src/routes/__tests__/admin-portal.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as adminPortalService from '@/services/admin-portal-service';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { adminOperators, adminAuditLogs, systemConfigurations, adminSessionHistory } from '@/db/schema/admin-portal';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    isNull: vi.fn(),
    eq: vi.fn(),
    orderBy: vi.fn().mockReturnThis(),
    desc: vi.fn(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

/**
 * Test suite for Admin Portal API endpoints
 */
describe('Admin Portal API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listActiveOperators', () => {
    it('should return a list of active operators', async () => {
      const mockOperators = [
        {
          id: '1',
          clerkId: 'clerk1',
          email: 'admin1@example.com',
          fullName: 'Admin One',
          role: 'admin',
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          deletedAt: null,
        },
      ];

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce(mockOperators),
              }),
            }),
          }),
        }),
      } as any);

      const result = await adminPortalService.listActiveOperators(10, 0);
      expect(result).toEqual(mockOperators);
    });

    it('should handle errors when listing operators fails', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockRejectedValueOnce(new Error('Database error')),
              }),
            }),
          }),
        }),
      } as any);

      await expect(adminPortalService.listActiveOperators(10, 0))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('createOperator', () => {
    it('should create a new operator successfully', async () => {
      const newOperator = {
        id: '1',
        clerkId: 'clerk1',
        email: 'admin1@example.com',
        fullName: 'Admin One',
        role: 'admin',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        deletedAt: null,
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([newOperator]),
        }),
      } as any);

      const result = await adminPortalService.createOperator(
        'clerk1',
        'admin1@example.com',
        'Admin One',
        'admin'
      );
      
      expect(result).toEqual(newOperator);
    });

    it('should throw an error when operator creation fails', async () => {
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      await expect(adminPortalService.createOperator(
        'clerk1',
        'admin1@example.com',
        'Admin One',
        'admin'
      )).rejects.toThrow('Failed to create operator');
    });
  });

  describe('updateOperator', () => {
    it('should update an existing operator', async () => {
      const updatedOperator = {
        id: '1',
        clerkId: 'clerk1',
        email: 'admin1@example.com',
        fullName: 'Updated Admin',
        role: 'admin',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        deletedAt: null,
      };

      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([updatedOperator]),
          }),
        }),
      } as any);

      const result = await adminPortalService.updateOperator('1', { fullName: 'Updated Admin' });
      expect(result).toEqual(updatedOperator);
    });

    it('should return null when operator to update is not found', async () => {
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      } as any);

      const result = await adminPortalService.updateOperator('999', { fullName: 'Non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('findOperatorById', () => {
    it('should find an operator by ID', async () => {
      const operator = {
        id: '1',
        clerkId: 'clerk1',
        email: 'admin1@example.com',
        fullName: 'Admin One',
        role: 'admin',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        deletedAt: null,
      };

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([operator]),
          }),
        }),
      } as any);

      const result = await adminPortalService.findOperatorById('1');
      expect(result).toEqual(operator);
    });

    it('should return null when operator is not found', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      } as any);

      const result = await adminPortalService.findOperatorById('999');
      expect(result).toBeNull();
    });
  });

  describe('logAuditAction', () => {
    it('should log an audit action successfully', async () => {
      const auditLog = {
        id: '1',
        operatorId: '1',
        action: 'CREATE_USER',
        targetEntityType: 'user',
        targetEntityId: '123',
        previousState: null,
        newState: { name: 'John' },
        reason: 'User request',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([auditLog]),
        }),
      } as any);

      const result = await adminPortalService.logAuditAction(
        '1',
        'CREATE_USER',
        'user',
        '123',
        null,
        { name: 'John' },
        'User request',
        '127.0.0.1',
        'Mozilla/5.0'
      );
      
      expect(result).toEqual(auditLog);
    });

    it('should throw an error when audit logging fails', async () => {
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      await expect(adminPortalService.logAuditAction(
        '1',
        'CREATE_USER',
        'user',
        '123',
        null,
        { name: 'John' },
        'User request',
        '127.0.0.1',
        'Mozilla/5.0'
      )).rejects.toThrow('Failed to log audit action');
    });
  });

  describe('queryAuditLogs', () => {
    it('should query audit logs with filters', async () => {
      const auditLogs = [
        {
          id: '1',
          operatorId: '1',
          action: 'CREATE_USER',
          targetEntityType: 'user',
          targetEntityId: '123',
          previousState: null,
          newState: { name: 'John' },
          reason: 'User request',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce(auditLogs),
              }),
            }),
          }),
        }),
      } as any);

      const result = await adminPortalService.queryAuditLogs(10, 0, 'CREATE_USER', '1');
      expect(result).toEqual(auditLogs);
    });

    it('should handle errors when querying audit logs fails', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockRejectedValueOnce(new Error('Database error')),
              }),
            }),
          }),
        }),
      } as any);

      await expect(adminPortalService.queryAuditLogs(10, 0, 'CREATE_USER', '1'))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getNonSensitiveConfigs', () => {
    it('should return non-sensitive system configurations', async () => {
      const configs = [
        {
          id: '1',
          key: 'feature_flag',
          value: true,
          description: 'Enables new feature',
          isSensitive: false,
          updatedBy: 'admin1',
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce(configs),
        }),
      } as any);

      const result = await adminPortalService.getNonSensitiveConfigs();
      expect(result).toEqual(configs);
    });

    it('should handle errors when fetching configs fails', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockRejectedValueOnce(new Error('Database error')),
        }),
      } as any);

      await expect(adminPortalService.getNonSensitiveConfigs())
        .rejects
        .toThrow('Database error');
    });
  });

  describe('updateSystemConfig', () => {
    it('should update a system configuration successfully', async () => {
      const existingConfig = {
        id: '1',
        key: 'feature_flag',
        value: false,
        description: 'Enables new feature',
        isSensitive: false,
        updatedBy: 'admin1',
        updatedAt: new Date(),
      };

      const updatedConfig = {
        ...existingConfig,
        value: true,
        updatedBy: 'admin2',
        updatedAt: new Date(),
      };

      vi.mocked(db.select).mockResolvedValueOnce([existingConfig]);
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([updatedConfig]),
          }),
        }),
      } as any);

      const result = await adminPortalService.updateSystemConfig('feature_flag', true, 'admin2');
      expect(result).toEqual(updatedConfig);
    });

    it('should return null when config key does not exist', async () => {
      vi.mocked(db.select).mockResolvedValueOnce([]);

      const result = await adminPortalService.updateSystemConfig('nonexistent_key', 'value', 'admin1');
      expect(result).toBeNull();
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session successfully', async () => {
      // Mock the update to return a successful revocation
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([{
              id: 'session1',
              operatorId: 'op1',
              tokenJti: 'jti123',
              isActive: false,
              endedAt: new Date(),
            }]),
          }),
        }),
      } as any);

      const result = await adminPortalService.revokeSession('jti123', 'op1');
      expect(result).toBe(true);
    });

    it('should return false when session to revoke is not found', async () => {
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      } as any);

      const result = await adminPortalService.revokeSession('nonexistent', 'op1');
      expect(result).toBe(false);
    });
  });
});
