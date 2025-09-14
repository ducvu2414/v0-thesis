"use client"

import type React from "react"
import { Row, Col, Card, Statistic, Typography, Table, Tag, Progress } from "antd"
import { useQuery } from "@tanstack/react-query"
import { BookOutlined, UserOutlined, TrophyOutlined, CalendarOutlined } from "@ant-design/icons"
import { apiClient } from "@/shared/api/client"
import { useAuth } from "@/app/providers/AuthProvider"
import { formatDate } from "@/shared/lib/utils"
import type { Topic } from "@/shared/types/topics"

const { Title } = Typography

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const { data: topics = [] } = useQuery({
    queryKey: ["topics", "dashboard"],
    queryFn: async () => {
      const params: any = {}
      if (user?.role === "STUDENT") {
        params.studentId = user.id
      } else if (user?.role === "SUPERVISOR") {
        params.supervisorId = user.id
      }

      const response = await apiClient.get<Topic[]>("/topics", params)
      return response.data
    },
  })

  const { data: reports } = useQuery({
    queryKey: ["reports", "overview"],
    queryFn: async () => {
      const response = await apiClient.get("/reports/overview")
      return response.data
    },
  })

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

  const columns = [
    {
      title: "Đề tài",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <div style={{ maxWidth: 300 }}>{text}</div>,
    },
    {
      title: "Sinh viên",
      dataIndex: "student",
      key: "student",
      render: (student: any) => student?.name || "-",
    },
    {
      title: "GVHD",
      dataIndex: "supervisor",
      key: "supervisor",
      render: (supervisor: any) => supervisor?.name || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => formatDate(date),
    },
  ]

  const completionRate = reports
    ? Math.round(((reports.topicsByStatus?.COMPLETED || 0) / reports.totalTopics) * 100)
    : 0

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đề tài"
              value={reports?.totalTopics || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={reports?.topicsByStatus?.IN_PROGRESS || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={reports?.topicsByStatus?.COMPLETED || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={reports?.averageScore || 0}
              precision={1}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Đề tài gần đây" style={{ height: 400 }}>
            <Table dataSource={topics.slice(0, 5)} columns={columns} pagination={false} size="small" rowKey="id" />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ hoàn thành" style={{ height: 400 }}>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Progress
                type="circle"
                percent={completionRate}
                size={120}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
              <div style={{ marginTop: 16 }}>
                <div>Tỷ lệ hoàn thành</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>{completionRate}%</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
