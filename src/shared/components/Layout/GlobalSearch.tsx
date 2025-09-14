"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Input, Modal, List, Avatar, Typography, Tag, Empty, Spin } from "antd"
import { SearchOutlined, UserOutlined, BookOutlined, CalendarOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { debounce } from "@/shared/lib/utils"
import { apiClient } from "@/shared/api/client"

const { Text } = Typography

interface SearchResult {
  id: string
  type: "topic" | "user" | "schedule"
  title: string
  subtitle?: string
  description?: string
  avatar?: string
  status?: string
  url: string
}

export const GlobalSearch: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { t } = useTranslation()

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
    }, 300),
    [],
  )

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["globalSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      const response = await apiClient.get<SearchResult[]>("/search", {
        q: searchQuery,
        limit: 20,
      })
      return response.data
    },
    enabled: !!searchQuery.trim(),
  })

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url)
    setIsModalOpen(false)
    setSearchQuery("")
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "topic":
        return <BookOutlined />
      case "user":
        return <UserOutlined />
      case "schedule":
        return <CalendarOutlined />
      default:
        return <SearchOutlined />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return "green"
      case "PENDING":
        return "orange"
      case "REJECTED":
        return "red"
      case "DRAFT":
        return "blue"
      default:
        return "default"
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return "Đã duyệt"
      case "PENDING":
        return "Chờ duyệt"
      case "REJECTED":
        return "Từ chối"
      case "DRAFT":
        return "Nháp"
      default:
        return status
    }
  }

  return (
    <>
      <Input
        placeholder={t("search.placeholder", "Tìm kiếm đề tài, người dùng, lịch...")}
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
        onFocus={() => setIsModalOpen(true)}
        readOnly
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SearchOutlined />
            {t("search.title", "Tìm kiếm")}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setSearchQuery("")
        }}
        footer={null}
        width={600}
        styles={{
          body: { padding: 0 },
        }}
      >
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Input
            placeholder={t("search.placeholder", "Tìm kiếm đề tài, người dùng, lịch...")}
            prefix={<SearchOutlined />}
            size="large"
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : searchResults.length === 0 ? (
            <Empty
              description={
                searchQuery.trim()
                  ? t("search.noResults", "Không tìm thấy kết quả nào")
                  : t("search.enterQuery", "Nhập từ khóa để tìm kiếm")
              }
              style={{ padding: 40 }}
            />
          ) : (
            <List
              dataSource={searchResults}
              renderItem={(result) => (
                <List.Item
                  style={{
                    padding: "12px 24px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      result.avatar ? <Avatar src={result.avatar} /> : <Avatar icon={getResultIcon(result.type)} />
                    }
                    title={
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{result.title}</span>
                        {result.status && (
                          <Tag color={getStatusColor(result.status)} size="small">
                            {getStatusText(result.status)}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        {result.subtitle && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {result.subtitle}
                          </Text>
                        )}
                        {result.description && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {result.description}
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {searchResults.length > 0 && (
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fafafa",
              textAlign: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("search.results", `Hiển thị ${searchResults.length} kết quả`)}
            </Text>
          </div>
        )}
      </Modal>
    </>
  )
}
