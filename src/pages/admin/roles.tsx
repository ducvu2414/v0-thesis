import type React from "react"
import { Card, Typography, Table, Tag, Space } from "antd"
import { ROLE_PERMISSIONS } from "@/shared/lib/rbac"
import type { UserRole } from "@/shared/types/auth"

const { Title } = Typography

export const AdminRolesPage: React.FC = () => {
  const getRoleText = (role: UserRole) => {
    const texts: Record<UserRole, string> = {
      ADMIN: "Quản trị viên",
      HOD: "Trưởng bộ môn",
      SUPERVISOR: "GVHD",
      REVIEWER: "GVPB",
      COUNCIL_CHAIR: "Chủ tịch HĐ",
      COUNCIL_SECRETARY: "Thư ký HĐ",
      COUNCIL_MEMBER: "Thành viên HĐ",
      STUDENT: "Sinh viên",
    }
    return texts[role] || role
  }

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMIN: "red",
      HOD: "purple",
      SUPERVISOR: "blue",
      REVIEWER: "green",
      COUNCIL_CHAIR: "orange",
      COUNCIL_SECRETARY: "cyan",
      COUNCIL_MEMBER: "geekblue",
      STUDENT: "default",
    }
    return colors[role] || "default"
  }

  const getPermissionText = (permission: any) => {
    const texts: Record<string, string> = {
      "topic.create": "Tạo đề tài",
      "topic.read": "Xem đề tài",
      "topic.update": "Sửa đề tài",
      "topic.delete": "Xóa đề tài",
      "topic.approve": "Duyệt đề tài",
      "topic.revise": "Sửa đổi đề tài",
      "progress.read": "Xem tiến độ",
      "progress.update": "Cập nhật tiến độ",
      "progress.feedback": "Phản hồi tiến độ",
      "submission.create": "Nộp bài",
      "submission.read": "Xem bài nộp",
      "submission.delete": "Xóa bài nộp",
      "review.create": "Tạo đánh giá",
      "review.read": "Xem đánh giá",
      "review.assign": "Phân công đánh giá",
      "score.create": "Chấm điểm",
      "score.read": "Xem điểm",
      "score.bonus": "Thưởng điểm",
      "schedule.create": "Tạo lịch",
      "schedule.read": "Xem lịch",
      "schedule.update": "Sửa lịch",
      "user.manage": "Quản lý người dùng",
      "role.manage": "Quản lý vai trò",
      "rubric.manage": "Quản lý rubric",
      "settings.manage": "Quản lý cài đặt",
      "reports.view": "Xem báo cáo",
    }
    return texts[`${permission.resource}.${permission.action}`] || `${permission.resource}.${permission.action}`
  }

  const roleData = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
    role: role as UserRole,
    permissions,
  }))

  const columns = [
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)} style={{ fontSize: 14, padding: "4px 8px" }}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: any[]) => (
        <Space wrap>
          {permissions.map((permission, index) => (
            <Tag key={index} color="blue" style={{ margin: "2px" }}>
              {getPermissionText(permission)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>Ma trận phân quyền</Title>

      <Card>
        <Table dataSource={roleData} columns={columns} rowKey="role" pagination={false} size="middle" />
      </Card>
    </div>
  )
}
