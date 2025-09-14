"use client"

import type React from "react"
import { useState } from "react"
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space } from "antd"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"
import { useAuth } from "@/app/providers/AuthProvider"
import { canAccessRoute } from "@/shared/lib/rbac"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { NotificationCenter } from "./NotificationCenter"
import { GlobalSearch } from "./GlobalSearch"

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: t("menu.dashboard"),
    },
    {
      key: "/topics",
      icon: <BookOutlined />,
      label: t("menu.topics"),
    },
    {
      key: "/schedules",
      icon: <CalendarOutlined />,
      label: t("menu.schedules"),
      children: [
        {
          key: "/schedules",
          label: t("menu.schedulesList"),
        },
        {
          key: "/schedules/availability",
          label: t("menu.availability"),
        },
      ],
    },
    {
      key: "/scoring",
      icon: <TrophyOutlined />,
      label: t("menu.scoring"),
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: t("menu.reports"),
      disabled: !canAccessRoute(user?.role || "STUDENT", "/reports"),
    },
    {
      key: "/admin",
      icon: <SettingOutlined />,
      label: t("menu.admin"),
      disabled: !canAccessRoute(user?.role || "STUDENT", "/admin"),
      children: [
        {
          key: "/admin/users",
          label: "Quản lý người dùng",
        },
        {
          key: "/admin/roles",
          label: "Phân quyền",
        },
        {
          key: "/admin/rubrics",
          label: "Rubric chấm điểm",
        },
        {
          key: "/admin/settings",
          label: "Cài đặt hệ thống",
        },
      ],
    },
  ].filter((item) => !item.disabled)

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("buttons.logout"),
      onClick: logout,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
            fontSize: collapsed ? 16 : 18,
            fontWeight: "bold",
            color: "#1890ff",
          }}
        >
          {collapsed ? "TMS" : "Thesis Management"}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <GlobalSearch />
          </div>

          <Space size="middle">
            <LanguageSwitcher />
            <NotificationCenter />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: 8,
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
