import type { Topic, User } from "./someModule" // Assuming Topic and User are imported from another module

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  type: EventType
  startTime: string
  endTime: string
  location?: string
  topicIds: string[]
  participantIds: string[]
  createdBy: string
  createdAt: string
  topics?: Topic[]
  participants?: User[]
  createdByUser?: User
}

export type EventType = "TRIAL_PRESENTATION" | "REVIEW_MEETING" | "COUNCIL_DEFENSE" | "POSTER_SESSION"

export interface CreateEventRequest {
  title: string
  description?: string
  type: EventType
  startTime: string
  endTime: string
  location?: string
  topicIds: string[]
  participantIds: string[]
}
