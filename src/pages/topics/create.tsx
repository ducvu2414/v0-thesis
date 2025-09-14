"use client"

import type React from "react"
import { Form, Input, Select, Button, Card, Typography, Row, Col, message } from "antd"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/api/client"
import type { CreateTopicRequest } from "@/shared/types/topics"
import type { User } from "@/shared/types/auth"

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

export const CreateTopicPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: students = [] } = useQuery({
    queryKey: ["users", "students"],
    queryFn: async () => {
      const response = await apiClient.get<User[]>("/users", { role: "STUDENT" })
      return response.data
    },
  })

  const createTopicMutation = useMutation({
    mutationFn: async (data: CreateTopicRequest) => {
      const response = await apiClient.post("/topics", data)
      return response.data
    },
    onSuccess: () => {
      message.success("Tạo đề tài thành công!")
      queryClient.invalidateQueries({ queryKey: ["topics"] })
      navigate("/topics")
    },
    onError: (error: any) => {
      message.error(error.message || "Có lỗi xảy ra khi tạo đề tài")
    },
  })

  const handleSubmit = (values: any) => {
    createTopicMutation.mutate(values)
  }

  return (
    <div>
      <Title level={2}>Tạo đề tài mới</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            academicYear: "2024-2025",
            department: "IT",
            faculty: "Công nghệ thông tin",
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                name="title"
                label="Tiêu đề đề tài"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề đề tài!" },
                  { min: 10, message: "Tiêu đề phải có ít nhất 10 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập tiêu đề đề tài..." />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả chi tiết!" },
                  { min: 50, message: "Mô tả phải có ít nhất 50 ký tự!" },
                ]}
              >
                <TextArea rows={6} placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi thực hiện..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="studentId"
                label="Sinh viên thực hiện"
                rules={[{ required: true, message: "Vui lòng chọn sinh viên!" }]}
              >
                <Select
                  placeholder="Chọn sinh viên..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {students.map((student) => (
                    <Option key={student.id} value={student.id}>
                      {student.name} ({student.profile.studentId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="academicYear"
                label="Năm học"
                rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}
              >
                <Select>
                  <Option value="2024-2025">2024-2025</Option>
                  <Option value="2025-2026">2025-2026</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="department"
                label="Bộ môn"
                rules={[{ required: true, message: "Vui lòng chọn bộ môn!" }]}
              >
                <Select>
                  <Option value="IT">Công nghệ thông tin</Option>
                  <Option value="CS">Khoa học máy tính</Option>
                  <Option value="SE">Kỹ thuật phần mềm</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="faculty" label="Khoa" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
                <Select>
                  <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
                  <Option value="Kỹ thuật">Kỹ thuật</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={createTopicMutation.isPending} style={{ marginRight: 8 }}>
              Tạo đề tài
            </Button>
            <Button onClick={() => navigate("/topics")}>Hủy</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
