export interface ProgressMilestone {
  id: string
  topicId: string
  type: MilestoneType
  title: string
  description: string
  deadline: string
  status: MilestoneStatus
  feedback?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export type MilestoneType = "OUTLINE" | "CHAPTER_1" | "CHAPTER_2" | "CHAPTER_3" | "COMPLETE"

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "NOT_PASS"

export interface UpdateProgressRequest {
  status: MilestoneStatus
  feedback?: string
}
