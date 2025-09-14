export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  profile: UserProfile
  createdAt: string
  updatedAt: string
}

export type UserRole =
  | "STUDENT"
  | "SUPERVISOR"
  | "REVIEWER"
  | "COUNCIL_CHAIR"
  | "COUNCIL_SECRETARY"
  | "COUNCIL_MEMBER"
  | "HOD"
  | "ADMIN"

export interface UserProfile {
  studentId?: string
  department: string
  faculty: string
  phone?: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  user: User
  token: string
}
