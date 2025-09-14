import type { User } from "./user" // Assuming User is defined in another file

export interface Topic {
  id: string
  title: string
  description: string
  status: TopicStatus
  studentId: string
  supervisorId: string
  reviewerIds: string[]
  department: string
  faculty: string
  academicYear: string
  defenseType?: DefenseType
  createdAt: string
  updatedAt: string
  student?: User
  supervisor?: User
  reviewers?: User[]
  revisions?: TopicRevision[]
}

export type TopicStatus = "PENDING" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "DEFENDED"

export type DefenseType = "POSTER" | "COUNCIL"

export interface TopicRevision {
  id: string
  topicId: string
  version: number
  title: string
  description: string
  changes: string
  note: string
  createdBy: string
  createdAt: string
  createdByUser?: User
}

export interface CreateTopicRequest {
  title: string
  description: string
  studentId: string
  department: string
  faculty: string
  academicYear: string
}

export interface UpdateTopicRequest {
  title?: string
  description?: string
  status?: TopicStatus
  defenseType?: DefenseType
}
