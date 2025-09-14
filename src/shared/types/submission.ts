import type { User } from "./user" // Assuming User is defined in another file

export interface Submission {
  id: string
  topicId: string
  type: SubmissionType
  version: number
  fileName: string
  fileSize: number
  fileUrl: string
  note?: string
  uploadedBy: string
  uploadedAt: string
  uploadedByUser?: User
}

export type SubmissionType = "CHAPTER" | "DRAFT" | "FINAL" | "POSTER" | "PRESENTATION"

export interface CreateSubmissionRequest {
  type: SubmissionType
  file: File
  note?: string
}
