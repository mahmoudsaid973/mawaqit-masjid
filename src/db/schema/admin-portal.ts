import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Admin Portal Schema
 * 
 * Defines tables specific to the administrative interface operations.
 * This includes audit logs, operator roles, and system configuration flags.
 * 
 * Conventions:
 * - All IDs are UUIDs
 * - Timestamps are UTC with defaults
 * - Soft deletes implemented via `deletedAt`
 * - Indexes added for common query patterns (audit lookups, role checks)
 */

// -----------------------------------------------------------------------------
// Operators (Admin Users managed internally or synced from Clerk)
// -----------------------------------------------------------------------------

export const adminOperators = pgTable(
  "admin_operators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    role: varchar("role", { length: 50 }).notNull().default("support"), // support, admin, super_admin
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    idxClerkId: index("idx_admin_operators_clerk_id").on(table.clerkId),
    idxRole: index("idx_admin_operators_role").on(table.role),
    idxEmail: index("idx_admin_operators_email").on(table.email),
  })
);

export const adminOperatorsRelations = relations(adminOperators, ({ many }) => ({
  auditLogs: many(adminAuditLogs),
  sessionHistory: many(adminSessionHistory),
}));

// -----------------------------------------------------------------------------
// Audit Logs (Immutable trail of admin actions)
// -----------------------------------------------------------------------------

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    operatorId: uuid("operator_id")
      .notNull()
      .references(() => adminOperators.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(), // e.g., "USER_BANNED", "REFUND_ISSUED"
    targetEntityType: varchar("target_entity_type", { length: 50 }).notNull(),
    targetEntityId: uuid("target_entity_id"),
    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    reason: text("reason"), // Mandatory reason for destructive actions
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxOperatorId: index("idx_audit_logs_operator_id").on(table.operatorId),
    idxAction: index("idx_audit_logs_action").on(table.action),
    idxTarget: index("idx_audit_logs_target").on(table.targetEntityType, table.targetEntityId),
    idxCreatedAt: index("idx_audit_logs_created_at").on(table.createdAt),
  })
);

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  operator: one(adminOperators, {
    fields: [adminAuditLogs.operatorId],
    references: [adminOperators.id],
  }),
}));

// -----------------------------------------------------------------------------
// Session History (Tracking admin portal usage)
// -----------------------------------------------------------------------------

export const adminSessionHistory = pgTable(
  "admin_session_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    operatorId: uuid("operator_id")
      .notNull()
      .references(() => adminOperators.id, { onDelete: "cascade" }),
    tokenJti: text("token_jti").unique().notNull(), // JWT ID for revocation tracking
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    idxOperatorId: index("idx_session_history_operator_id").on(table.operatorId),
    idxTokenJti: index("idx_session_history_token_jti").on(table.tokenJti),
    idxActive: index("idx_session_history_is_active").on(table.isActive),
  })
);

export const adminSessionHistoryRelations = relations(adminSessionHistory, ({ one }) => ({
  operator: one(adminOperators, {
    fields: [adminSessionHistory.operatorId],
    references: [adminOperators.id],
  }),
}));

// -----------------------------------------------------------------------------
// System Configuration (Feature flags, kill switches)
// -----------------------------------------------------------------------------

export const systemConfigurations = pgTable(
  "system_configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: jsonb("value").notNull(),
    description: text("description"),
    isSensitive: boolean("is_sensitive").notNull().default(false), // Masks value in logs/UI
    updatedBy: uuid("updated_by").references(() => adminOperators.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxKey: index("idx_sys_config_key").on(table.key),
  })
);

export const systemConfigurationsRelations = relations(systemConfigurations, ({ one }) => ({
  updater: one(adminOperators, {
    fields: [systemConfigurations.updatedBy],
    references: [adminOperators.id],
  }),
}));

export const adminPortal = pgTable("admin_portal", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}); // Wave15.4: real minimal pgTable backfill (was {} as Record<string, unknown>)
