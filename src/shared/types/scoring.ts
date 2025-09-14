import type { User, Topic } from "./user-topic" // Assuming User and Topic are declared in another file

export interface Rubric {
  id: string
  name: string
  type: RubricType
  criteria: RubricCriteria[]
  maxScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RubricType = "SUPERVISOR" | "REVIEWER" | "COUNCIL"

export interface RubricCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
}

export interface ScoreSheet {
  id: string
  topicId: string
  rubricId: string
  scorerId: string
  type: ScoreType
  scores: CriteriaScore[]
  totalScore: number
  comments?: string
  createdAt: string
  updatedAt: string
  modifiedBy?: string
  modificationReason?: string
  previousScore?: number
  changeHistory?: ScoreChange[]
  scorer?: User
  rubric?: Rubric
}

export type ScoreType = "SUPERVISOR" | "REVIEWER" | "COUNCIL"

export interface CriteriaScore {
  criteriaId: string
  score: number
}

export interface FinalScore {
  id: string
  topicId: string
  supervisorScore: number
  reviewerScore: number
  councilScore: number
  finalScore: number
  bonusScore: number
  totalScore: number
  bonusReason?: string
  calculatedAt: string
  calculatedBy: string
  modifiedBy?: string
  modificationReason?: string
  previousTotalScore?: number
  changeHistory?: ScoreChange[]
  topic?: Topic
  calculatedByUser?: User
}

export interface ScoreChange {
  id: string
  timestamp: string
  changedBy: string
  changedByUser?: User
  field: string
  oldValue: number | string
  newValue: number | string
  reason?: string
  ipAddress?: string
}

export interface CreateScoreRequest {
  rubricId: string
  scores: CriteriaScore[]
  comments?: string
  modificationReason?: string
}
