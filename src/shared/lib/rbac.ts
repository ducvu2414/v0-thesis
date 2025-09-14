import type { UserRole } from "../types/auth"

export interface Permission {
  resource: string
  action: string
}

export const PERMISSIONS = {
  // Topic permissions
  TOPIC_CREATE: { resource: "topic", action: "create" },
  TOPIC_READ: { resource: "topic", action: "read" },
  TOPIC_UPDATE: { resource: "topic", action: "update" },
  TOPIC_DELETE: { resource: "topic", action: "delete" },
  TOPIC_APPROVE: { resource: "topic", action: "approve" },
  TOPIC_REVISE: { resource: "topic", action: "revise" },

  // Progress permissions
  PROGRESS_READ: { resource: "progress", action: "read" },
  PROGRESS_UPDATE: { resource: "progress", action: "update" },
  PROGRESS_FEEDBACK: { resource: "progress", action: "feedback" },

  // Submission permissions
  SUBMISSION_CREATE: { resource: "submission", action: "create" },
  SUBMISSION_READ: { resource: "submission", action: "read" },
  SUBMISSION_DELETE: { resource: "submission", action: "delete" },

  // Review permissions
  REVIEW_CREATE: { resource: "review", action: "create" },
  REVIEW_READ: { resource: "review", action: "read" },
  REVIEW_ASSIGN: { resource: "review", action: "assign" },

  // Scoring permissions
  SCORE_CREATE: { resource: "score", action: "create" },
  SCORE_READ: { resource: "score", action: "read" },
  SCORE_BONUS: { resource: "score", action: "bonus" },

  // Schedule permissions
  SCHEDULE_CREATE: { resource: "schedule", action: "create" },
  SCHEDULE_READ: { resource: "schedule", action: "read" },
  SCHEDULE_UPDATE: { resource: "schedule", action: "update" },

  // Admin permissions
  USER_MANAGE: { resource: "user", action: "manage" },
  ROLE_MANAGE: { resource: "role", action: "manage" },
  RUBRIC_MANAGE: { resource: "rubric", action: "manage" },
  SETTINGS_MANAGE: { resource: "settings", action: "manage" },

  // Reports permissions
  REPORTS_VIEW: { resource: "reports", action: "view" },
} as const

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  STUDENT: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.PROGRESS_READ,
    PERMISSIONS.PROGRESS_UPDATE,
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_DELETE,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_READ,
  ],

  SUPERVISOR: [
    PERMISSIONS.TOPIC_CREATE,
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.TOPIC_UPDATE,
    PERMISSIONS.PROGRESS_READ,
    PERMISSIONS.PROGRESS_FEEDBACK,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_CREATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SCHEDULE_UPDATE,
  ],

  REVIEWER: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_CREATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_READ,
  ],

  COUNCIL_CHAIR: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_CREATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SCHEDULE_UPDATE,
  ],

  COUNCIL_SECRETARY: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_CREATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_READ,
  ],

  COUNCIL_MEMBER: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.SCORE_CREATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCHEDULE_READ,
  ],

  HOD: [
    PERMISSIONS.TOPIC_READ,
    PERMISSIONS.TOPIC_APPROVE,
    PERMISSIONS.TOPIC_REVISE,
    PERMISSIONS.PROGRESS_READ,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.REVIEW_ASSIGN,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCORE_BONUS,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SCHEDULE_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
  ],

  ADMIN: Object.values(PERMISSIONS),
}

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.some((p) => p.resource === permission.resource && p.action === permission.action)
}

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": [PERMISSIONS.TOPIC_READ],
    "/topics": [PERMISSIONS.TOPIC_READ],
    "/topics/create": [PERMISSIONS.TOPIC_CREATE],
    "/schedules": [PERMISSIONS.SCHEDULE_READ],
    "/scoring": [PERMISSIONS.SCORE_READ],
    "/reports": [PERMISSIONS.REPORTS_VIEW],
    "/admin": [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.ROLE_MANAGE,
      PERMISSIONS.RUBRIC_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
    ],
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) return true

  return hasAnyPermission(userRole, requiredPermissions)
}
