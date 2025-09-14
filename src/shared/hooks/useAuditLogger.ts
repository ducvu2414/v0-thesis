"use client"

import { useMutation } from "@tanstack/react-query"
import { apiClient } from "../api/client"
import { useAuth } from "../../app/providers/AuthProvider"
import type { CreateAuditLogRequest, AuditEntityType, AuditAction, AuditChange } from "../types/audit"

export const useAuditLogger = () => {
  const { user } = useAuth()

  const logMutation = useMutation({
    mutationFn: async (request: CreateAuditLogRequest) => {
      const response = await apiClient.post("/audit/logs", {
        ...request,
        userId: user?.id,
        userName: user?.name,
        userRole: user?.role,
        timestamp: new Date().toISOString(),
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
      })
      return response.data
    },
  })

  const logAction = async (
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    changes: AuditChange[],
    metadata?: Record<string, any>,
  ) => {
    try {
      await logMutation.mutateAsync({
        entityType,
        entityId,
        action,
        changes,
        metadata,
      })
    } catch (error) {
      console.error("Failed to log audit action:", error)
      // Don't throw error to avoid breaking the main functionality
    }
  }

  const logScoreChange = async (
    topicId: string,
    scoreType: "SUPERVISOR" | "REVIEWER" | "COUNCIL" | "FINAL",
    oldScore: number,
    newScore: number,
    reason?: string,
    metadata?: Record<string, any>,
  ) => {
    await logAction(
      "SCORE",
      topicId,
      "SCORE_CHANGE",
      [
        {
          field: scoreType.toLowerCase() + "Score",
          oldValue: oldScore,
          newValue: newScore,
          changeReason: reason,
        },
      ],
      {
        scoreType,
        topicId,
        ...metadata,
      },
    )
  }

  return {
    logAction,
    logScoreChange,
    isLogging: logMutation.isPending,
  }
}
