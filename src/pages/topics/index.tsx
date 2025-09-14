"use client"

import type React from "react"
import { useState } from "react"
import { Table, Button, Input, Select, Tag, Typography, Card, Row, Col } from "antd"
import { PlusOutlined, SearchOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/shared/api/client"
import { useAuth } from "@/app/providers/AuthProvider"
import { formatDate, debounce } from "@/shared/lib/utils"
import { hasPermission, PERMISSIONS } from "@/shared/lib/rbac"
import type { Topic } from "@/shared/types/topics"

const { Title } = Typography
const { Option } = Select

export const TopicsPage: React.FC = () => {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("")

  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["topics", searchText, statusFilter, departmentFilter],
    queryFn: async () => {
      const params: any = {}
      if (searchText) params.search = searchText
      if (statusFilter) params.status = statusFilter
      if (departmentFilter) params.department = departmentFilter

      // Filter by user role
      if (user?.role === "STUDENT") {
        params.studentId = user.id
      } else if (user?.role === "SUPERVISOR") {
        params.supervisorId = user.id
      }

      const response = await apiClient.get<Topic[]>("/topics", params)
      return response.data
    },
  })

  const debouncedSearch = debounce((value: string) => {
    setSearchText(value)
  }, 500)

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
      render: (text: string, record: Topic) => (
        <Button
          type="link"
          onClick={() => navigate(`/topics/${record.id}`)}
          style={{ padding: 0, height: "auto", textAlign: "left" }}
        >
          <div style={{ maxWidth: 400 }}>{text}</div>
        </Button>
      ),
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
      title: "Bộ môn",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: "Năm học",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => formatDate(date),
    },
  ]

  const canCreateTopic = hasPermission(user?.role || "STUDENT", PERMISSIONS.TOPIC_CREATE)

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Quản lý đề tài</Title>
        </Col>
        <Col>
          {canCreateTopic && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/topics/create")}>
              Tạo đề tài mới
            </Button>
          )}
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm đề tài, sinh viên, GVHD..."
              prefix={<SearchOutlined />}
              onChange={(e) => debouncedSearch(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="IN_PROGRESS">Đang thực hiện</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="DEFENDED">Đã bảo vệ</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Bộ môn"
              style={{ width: "100%" }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
            >
              <Option value="IT">Công nghệ thông tin</Option>
              <Option value="CS">Khoa học máy tính</Option>
              <Option value="SE">Kỹ thuật phần mềm</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={topics}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề tài`,
          }}
        />
      </Card>
    </div>
  )
}
