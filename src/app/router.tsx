"use client"

import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./providers/AuthProvider"
import { Layout } from "@/shared/components/Layout"
import { RoleGuard } from "@/shared/components/RoleGuard"

// Pages
import { LoginPage } from "@/pages/login"
import { DashboardPage } from "@/pages/dashboard"
import { TopicsPage } from "@/pages/topics"
import { CreateTopicPage } from "@/pages/topics/create"
import { TopicDetailPage } from "@/pages/topics/[topicId]"
import { SchedulesPage } from "@/pages/schedules"
import { ScoringPage } from "@/pages/scoring"
import { ReportsPage } from "@/pages/reports"
import { AdminUsersPage } from "@/pages/admin/users"
import { AdminRolesPage } from "@/pages/admin/roles"
import { AdminRubricsPage } from "@/pages/admin/rubrics"
import { AdminSettingsPage } from "@/pages/admin/settings"
import { AvailabilityPage } from "@/pages/schedules/availability"

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/topics" element={<TopicsPage />} />
        <Route
          path="/topics/create"
          element={
            <RoleGuard roles={["SUPERVISOR", "ADMIN"]}>
              <CreateTopicPage />
            </RoleGuard>
          }
        />
        <Route path="/topics/:topicId/*" element={<TopicDetailPage />} />

        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/schedules/availability" element={<AvailabilityPage />} />
        <Route path="/scoring" element={<ScoringPage />} />

        <Route
          path="/reports"
          element={
            <RoleGuard roles={["HOD", "ADMIN"]}>
              <ReportsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleGuard roles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RoleGuard roles={["ADMIN"]}>
              <AdminRolesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/rubrics"
          element={
            <RoleGuard roles={["ADMIN", "HOD"]}>
              <AdminRubricsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleGuard roles={["ADMIN"]}>
              <AdminSettingsPage />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
