"use client"

import type React from "react"
import { Row, Col, Card, Statistic, Typography, Progress, Button, Space, message } from "antd"
import {
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { apiClient } from "@/shared/api/client"
import { exportToCSV, exportToPDF } from "@/shared/lib/export"

const { Title } = Typography

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export const ReportsPage: React.FC = () => {
  const { data: reports } = useQuery({
    queryKey: ["reports", "overview"],
    queryFn: async () => {
      const response = await apiClient.get("/reports/overview")
      return response.data
    },
  })

  const statusData = reports?.topicsByStatus
    ? Object.entries(reports.topicsByStatus).map(([status, count]) => ({
        name: getStatusText(status),
        value: count as number,
      }))
    : []

  const defenseTypeData = reports?.defenseTypeDistribution
    ? Object.entries(reports.defenseTypeDistribution).map(([type, count]) => ({
        name: type === "POSTER" ? "Poster" : "Hội đồng",
        value: count as number,
      }))
    : []

  function getStatusText(status: string) {
    const texts: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      DEFENDED: "Đã bảo vệ",
    }
    return texts[status] || status
  }

  const completionRate = reports
    ? Math.round(
        (((reports.topicsByStatus?.COMPLETED || 0) + (reports.topicsByStatus?.DEFENDED || 0)) / reports.totalTopics) *
          100,
      )
    : 0

  const handleExportCSV = () => {
    if (!reports) {
      message.error("Không có dữ liệu để xuất")
      return
    }

    try {
      const exportData = {
        totalTopics: reports.totalTopics,
        topicsByStatus: reports.topicsByStatus,
        averageScore: reports.averageScore,
        defenseTypeDistribution: reports.defenseTypeDistribution,
        completionRate,
      }

      exportToCSV(exportData, `bao-cao-thong-ke-${new Date().toISOString().split("T")[0]}`)
      message.success("Xuất file CSV thành công!")
    } catch (error) {
      message.error("Lỗi khi xuất file CSV")
    }
  }

  const handleExportPDF = async () => {
    if (!reports) {
      message.error("Không có dữ liệu để xuất")
      return
    }

    try {
      message.loading("Đang tạo file PDF...", 0)
      await exportToPDF("reports-content", `bao-cao-thong-ke-${new Date().toISOString().split("T")[0]}`)
      message.destroy()
      message.success("Xuất file PDF thành công!")
    } catch (error) {
      message.destroy()
      message.error("Lỗi khi xuất file PDF")
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2}>Báo cáo thống kê</Title>
        <Space>
          <Button type="default" icon={<FileExcelOutlined />} onClick={handleExportCSV}>
            Xuất CSV
          </Button>
          <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Xuất PDF
          </Button>
        </Space>
      </div>

      <div id="reports-content">
        {/* Overview Cards */}
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
                value={(reports?.topicsByStatus?.COMPLETED || 0) + (reports?.topicsByStatus?.DEFENDED || 0)}
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

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Phân bố theo trạng thái" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Hình thức bảo vệ" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={defenseTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {defenseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Progress Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Tỷ lệ hoàn thành theo bộ môn" style={{ height: 300 }}>
              <div style={{ padding: "20px 0" }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Công nghệ thông tin</span>
                    <span>85%</span>
                  </div>
                  <Progress percent={85} strokeColor="#52c41a" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Khoa học máy tính</span>
                    <span>72%</span>
                  </div>
                  <Progress percent={72} strokeColor="#1890ff" />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Kỹ thuật phần mềm</span>
                    <span>68%</span>
                  </div>
                  <Progress percent={68} strokeColor="#fa8c16" />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Tổng quan tiến độ" style={{ height: 300 }}>
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
                  <div>Tỷ lệ hoàn thành tổng</div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>{completionRate}%</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
