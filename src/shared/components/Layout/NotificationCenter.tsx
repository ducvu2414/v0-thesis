"use client"

import type React from "react"
import { useState } from "react"
import { Badge, Button, Dropdown, List, Typography, Empty, Space, Tag, Avatar } from "antd"
import {
  BellOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  FileTextOutlined,
  MessageOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/api/client"
import { useAuth } from "@/app/providers/AuthProvider"
import { formatRelativeTime } from "@/shared/lib/utils"
import type { Notification, NotificationType } from "@/shared/types/notification"

const { Text } = Typography

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const response = await apiClient.get<Notification[]>("/notifications", {
        userId: user?.id,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.patch(`/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/notifications/${notificationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/mark-all-read", { userId: user?.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] })
    },
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      DEADLINE_REMINDER: <ClockCircleOutlined style={{ color: "#fa8c16" }} />,
      SCHEDULE_UPDATE: <CalendarOutlined style={{ color: "#1890ff" }} />,
      REVIEW_ASSIGNED: <UserOutlined style={{ color: "#52c41a" }} />,
      SCORE_UPDATED: <TrophyOutlined style={{ color: "#722ed1" }} />,
      STATUS_CHANGED: <FileTextOutlined style={{ color: "#13c2c2" }} />,
      CHAT_MESSAGE: <MessageOutlined style={{ color: "#eb2f96" }} />,
    }
    return iconMap[type] || <BellOutlined />
  }

  const getNotificationTypeLabel = (type: NotificationType) => {
    const labelMap = {
      DEADLINE_REMINDER: { text: "Deadline", color: "orange" },
      SCHEDULE_UPDATE: { text: "Lịch trình", color: "blue" },
      REVIEW_ASSIGNED: { text: "Phản biện", color: "green" },
      SCORE_UPDATED: { text: "Điểm số", color: "purple" },
      STATUS_CHANGED: { text: "Trạng thái", color: "cyan" },
      CHAT_MESSAGE: { text: "Tin nhắn", color: "magenta" },
    }
    return labelMap[type] || { text: type, color: "default" }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }

    // Navigate based on notification data
    if (notification.data?.topicId) {
      window.location.href = `/topics/${notification.data.topicId}`
    } else if (notification.data?.eventId) {
      window.location.href = `/schedules/${notification.data.eventId}`
    }
  }

  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text strong style={{ fontSize: 16 }}>
            Thông báo
          </Text>
          <Space size="small">
            <Button type="text" size="small" onClick={() => setFilter(filter === "all" ? "unread" : "all")}>
              {filter === "all" ? "Chưa đọc" : "Tất cả"}
            </Button>
            {unreadCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => markAllAsReadMutation.mutate()}
                loading={markAllAsReadMutation.isPending}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Space>
        </div>
        {unreadCount > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {unreadCount} thông báo chưa đọc
          </Text>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {filteredNotifications.length === 0 ? (
          <Empty
            description={filter === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo nào"}
            style={{ padding: "40px 20px" }}
          />
        ) : (
          <List
            size="small"
            dataSource={filteredNotifications.slice(0, 20)}
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor: notification.isRead ? "transparent" : "#f6ffed",
                  borderLeft: notification.isRead ? "none" : "3px solid #52c41a",
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? "#fafafa" : "#f0f9ff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? "transparent" : "#f6ffed"
                }}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotificationMutation.mutate(notification.id)
                    }}
                    loading={deleteNotificationMutation.isPending}
                    style={{ color: "#ff4d4f" }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      size="small"
                      style={{ backgroundColor: "transparent" }}
                    />
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontWeight: notification.isRead ? "normal" : "bold",
                          fontSize: 14,
                        }}
                      >
                        {notification.title}
                      </span>
                      <Tag size="small" color={getNotificationTypeLabel(notification.type).color}>
                        {getNotificationTypeLabel(notification.type).text}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          marginBottom: 4,
                          lineHeight: "1.4",
                        }}
                      >
                        {notification.message}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatRelativeTime(notification.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 20 && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <Button type="link" size="small">
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      trigger={["click"]}
      overlayStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  )
}
