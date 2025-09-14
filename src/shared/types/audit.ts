export interface AuditLog {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  userId: string
  userName: string
  userRole: string
  timestamp: string
  changes: AuditChange[]
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export type AuditEntityType = "TOPIC" | "SUBMISSION" | "SCORE" | "SCHEDULE" | "USER" | "REVIEW"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "SUBMIT" | "SCORE_CHANGE"

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  changeReason?: string
}

export interface ScoreAuditLog extends AuditLog {
  entityType: "SCORE"
  scoreType: "SUPERVISOR" | "REVIEWER" | "COUNCIL" | "FINAL"
  topicId: string
  topicTitle: string
  studentName: string
}

export interface CreateAuditLogRequest {
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  changes: AuditChange[]
  metadata?: Record<string, any>
}
