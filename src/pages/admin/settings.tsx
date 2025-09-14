import type React from "react"
import { Typography } from "antd"

const { Title } = Typography

export const AdminSettingsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Cài đặt hệ thống</Title>
      <p>Trang cài đặt hệ thống sẽ được phát triển trong phiên bản tiếp theo.</p>
    </div>
  )
}
