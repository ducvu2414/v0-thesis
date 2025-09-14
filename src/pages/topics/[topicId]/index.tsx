"use client"

import type React from "react"
import { useParams } from "react-router-dom"
import { Tabs, Card, Typography, Tag, Row, Col, Descriptions, Button, Space } from "antd"
import { useQuery } from "@tanstack/react-query"
import {
  FileTextOutlined,
  UploadOutlined,
  CommentOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MessageOutlined,
} from "@ant-design/icons"
import { apiClient } from "@/shared/api/client"
import { formatDate } from "@/shared/lib/utils"
import { useAuth } from "@/app/providers/AuthProvider"
import type { Topic } from "@/shared/types/topics"
import { SubmissionsTab } from "./components/SubmissionsTab"

// Tab components (simplified for demo)
const ProgressTab = () => <div>Progress content here</div>
const ReviewsTab = () => <div>Reviews content here</div>
const ScheduleTab = () => <div>Schedule content here</div>
const ScoringTab = () => <div>Scoring content here</div>
const ChatTab = () => <div>Chat content here</div>

const { Title } = Typography

export const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>()
  const { user } = useAuth()

  const { data: topic, isLoading } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: async () => {
      const response = await apiClient.get<Topic>(`/topics/${topicId}`)
      return response.data
    },
    enabled: !!topicId,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!topic) {
    return <div>Topic not found</div>
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "orange",
      APPROVED: "blue",
      IN_PROGRESS: "cyan",
      COMPLETED: "green",
      DEFENDED: "purple",
    }
    return colors[status] || "default"
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      DEFENDED: "Đã bảo vệ",
    }
    return texts[status] || status
  }

  const tabItems = [
    {
      key: "progress",
      label: (
        <span>
          <FileTextOutlined />
          Tiến độ
        </span>
      ),
      children: <ProgressTab />,
    },
    {
      key: "submissions",
      label: (
        <span>
          <UploadOutlined />
          Nộp bài
        </span>
      ),
      children: <SubmissionsTab topicId={topicId!} />,
    },
    {
      key: "reviews",
      label: (
        <span>
          <CommentOutlined />
          Phản biện
        </span>
      ),
      children: <ReviewsTab />,
    },
    {
      key: "schedule",
      label: (
        <span>
          <CalendarOutlined />
          Lịch trình
        </span>
      ),
      children: <ScheduleTab />,
    },
    {
      key: "scoring",
      label: (
        <span>
          <TrophyOutlined />
          Chấm điểm
        </span>
      ),
      children: <ScoringTab />,
    },
    {
      key: "chat",
      label: (
        <span>
          <MessageOutlined />
          Trao đổi
        </span>
      ),
      children: <ChatTab />,
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="top">
          <Col xs={24} lg={18}>
            <Title level={3} style={{ marginBottom: 16 }}>
              {topic.title}
            </Title>

            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(topic.status)}>{getStatusText(topic.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sinh viên">{topic.student?.name}</Descriptions.Item>
              <Descriptions.Item label="GVHD">{topic.supervisor?.name}</Descriptions.Item>
              <Descriptions.Item label="Bộ môn">{topic.department}</Descriptions.Item>
              <Descriptions.Item label="Năm học">{topic.academicYear}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật">{formatDate(topic.updatedAt)}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <strong>Mô tả:</strong>
              <p style={{ marginTop: 8, color: "#666" }}>{topic.description}</p>
            </div>
          </Col>

          <Col xs={24} lg={6} style={{ textAlign: "right" }}>
            <Space direction="vertical">
              <Button type="primary">Chỉnh sửa</Button>
              <Button>Xuất PDF</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs defaultActiveKey="progress" items={tabItems} size="large" />
      </Card>
    </div>
  )
}
