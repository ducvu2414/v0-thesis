"use client"

import type React from "react"
import { useState } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, Tag, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/api/client"
import { formatDate } from "@/shared/lib/utils"
import type { User, UserRole } from "@/shared/types/auth"

const { Option } = Select

export const AdminUsersPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get<User[]>("/users")
      return response.data
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiClient.post("/users", userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsModalVisible(false)
      form.resetFields()
      setEditingUser(null)
      message.success("Tạo người dùng thành công!")
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      const response = await apiClient.put(`/users/${id}`, userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsModalVisible(false)
      form.resetFields()
      setEditingUser(null)
      message.success("Cập nhật người dùng thành công!")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      message.success("Xóa người dùng thành công!")
    },
  })

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

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => <Tag color={getRoleColor(role)}>{getRoleText(role)}</Tag>,
    },
    {
      title: "Bộ môn",
      dataIndex: ["profile", "department"],
      key: "department",
    },
    {
      title: "Khoa",
      dataIndex: ["profile", "faculty"],
      key: "faculty",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record: User) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalVisible(true)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.profile.department,
      faculty: user.profile.faculty,
      phone: user.profile.phone,
      studentId: user.profile.studentId,
    })
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa người dùng này?",
      onOk: () => deleteUserMutation.mutate(id),
    })
  }

  const handleSubmit = (values: any) => {
    const userData = {
      ...values,
      profile: {
        department: values.department,
        faculty: values.faculty,
        phone: values.phone,
        studentId: values.studentId,
      },
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...userData })
    } else {
      createUserMutation.mutate(userData)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Quản lý người dùng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Thêm người dùng
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
        }}
      />

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingUser(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
            <Input placeholder="Nhập họ tên..." />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email..." />
          </Form.Item>

          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
            <Select placeholder="Chọn vai trò...">
              <Option value="STUDENT">Sinh viên</Option>
              <Option value="SUPERVISOR">GVHD</Option>
              <Option value="REVIEWER">GVPB</Option>
              <Option value="COUNCIL_CHAIR">Chủ tịch HĐ</Option>
              <Option value="COUNCIL_SECRETARY">Thư ký HĐ</Option>
              <Option value="COUNCIL_MEMBER">Thành viên HĐ</Option>
              <Option value="HOD">Trưởng bộ môn</Option>
              <Option value="ADMIN">Quản trị viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name="department" label="Bộ môn" rules={[{ required: true, message: "Vui lòng chọn bộ môn!" }]}>
            <Select placeholder="Chọn bộ môn...">
              <Option value="IT">Công nghệ thông tin</Option>
              <Option value="CS">Khoa học máy tính</Option>
              <Option value="SE">Kỹ thuật phần mềm</Option>
            </Select>
          </Form.Item>

          <Form.Item name="faculty" label="Khoa" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
            <Select placeholder="Chọn khoa...">
              <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
              <Option value="Kỹ thuật">Kỹ thuật</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại..." />
          </Form.Item>

          <Form.Item
            name="studentId"
            label="Mã sinh viên"
            style={{ display: form.getFieldValue("role") === "STUDENT" ? "block" : "none" }}
          >
            <Input placeholder="Nhập mã sinh viên..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                  setEditingUser(null)
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {editingUser ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
