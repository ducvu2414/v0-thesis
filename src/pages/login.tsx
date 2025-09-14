"use client"

import type React from "react"
import { Form, Input, Button, Card, Typography, Checkbox } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useAuth } from "@/app/providers/AuthProvider"
import { useTranslation } from "react-i18next"
import type { LoginCredentials } from "@/shared/types/auth"

const { Title, Text } = Typography

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth()
  const { t } = useTranslation()

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await login(values)
    } catch (error) {
      // Error is handled in AuthProvider
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
            Thesis Management System
          </Title>
          <Text type="secondary">Hệ thống quản lý khóa luận tốt nghiệp</Text>
        </div>

        <Form name="login" onFinish={handleSubmit} autoComplete="off" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("forms.email")} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t("forms.password")} />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>{t("forms.remember")}</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              {t("buttons.login")}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 6 }}>
          <Text strong>Tài khoản demo:</Text>
          <br />
          <Text>Admin: admin@university.edu.vn / password</Text>
          <br />
          <Text>Sinh viên: student1@student.university.edu.vn / password</Text>
          <br />
          <Text>GVHD: supervisor1@university.edu.vn / password</Text>
        </div>
      </Card>
    </div>
  )
}
