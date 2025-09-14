import type { User, DefenseType } from "./user" // Assuming User and DefenseType are declared in user.ts

export interface Review {
  id: string
  topicId: string
  reviewerId: string
  type: ReviewType
  status: ReviewStatus
  score?: number
  comments: string
  createdAt: string
  updatedAt: string
  reviewer?: User
}

export type ReviewType = "PRE_ASSESSMENT" | "REVIEWER_1" | "REVIEWER_2" | "REVIEWER_3"

export type ReviewStatus = "PENDING" | "PASS" | "FAIL"

export interface CreateReviewRequest {
  type: ReviewType
  status: ReviewStatus
  score?: number
  comments: string
}

export interface PreAssessment {
  id: string
  topicId: string
  supervisorId: string
  defenseType: DefenseType
  recommendation: string
  createdAt: string
  supervisor?: User
}
