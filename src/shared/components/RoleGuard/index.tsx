"use client"

import type React from "react"
import { Result, Button } from "antd"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"
import type { UserRole } from "@/shared/types/auth"

interface RoleGuardProps {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user || !roles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => navigate("/dashboard")}>
            Về trang chủ
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
