import type React from "react"
import { Card, Table, Tag, Typography, Space, Tooltip } from "antd"
import { ClockCircleOutlined, UserOutlined, EditOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../api/client"
import { formatDateTime } from "../../lib/utils"
import type { ScoreChange } from "../../types/scoring"

const { Text, Title } = Typography

interface ScoreAuditTrailProps {
  topicId: string
  scoreType?: "SUPERVISOR" | "REVIEWER" | "COUNCIL" | "FINAL"
}

export const ScoreAuditTrail: React.FC<ScoreAuditTrailProps> = ({ topicId, scoreType }) => {
  const { t } = useTranslation()

  const { data: scoreHistory = [], isLoading } = useQuery({
    queryKey: ["scoreHistory", topicId, scoreType],
    queryFn: async () => {
      const response = await apiClient.get<ScoreChange[]>(`/topics/${topicId}/scoring/history`, { scoreType })
      return response.data
    },
  })

  const columns = [
    {
      title: t("audit.timestamp"),
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <Text>{formatDateTime(timestamp)}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: t("audit.changedBy"),
      dataIndex: "changedByUser",
      key: "changedBy",
      render: (user: any, record: ScoreChange) => (
        <Space>
          <UserOutlined className="text-gray-400" />
          <Text>{user?.name || record.changedBy}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: t("audit.field"),
      dataIndex: "field",
      key: "field",
      render: (field: string) => <Tag color="blue">{field}</Tag>,
      width: 120,
    },
    {
      title: t("audit.change"),
      key: "change",
      render: (_, record: ScoreChange) => (
        <Space direction="vertical" size="small">
          <div className="flex items-center space-x-2">
            <Text type="secondary" delete className="text-sm">
              {record.oldValue}
            </Text>
            <EditOutlined className="text-gray-400 text-xs" />
            <Text type="success" className="text-sm font-medium">
              {record.newValue}
            </Text>
          </div>
          {record.reason && (
            <Tooltip title={record.reason}>
              <Text type="secondary" className="text-xs italic">
                {record.reason.length > 50 ? `${record.reason.substring(0, 50)}...` : record.reason}
              </Text>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const getScoreTypeText = (type: string) => {
    const typeMap = {
      SUPERVISOR: t("scoring.supervisorScore"),
      REVIEWER: t("scoring.reviewerScore"),
      COUNCIL: t("scoring.councilScore"),
      FINAL: t("scoring.finalScore"),
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          {scoreType ? `${t("audit.scoreHistory")} - ${getScoreTypeText(scoreType)}` : t("audit.scoreHistory")}
        </Space>
      }
      size="small"
    >
      {scoreHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t("audit.noScoreChanges")}</div>
      ) : (
        <Table
          dataSource={scoreHistory}
          columns={columns}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t("common.of")} ${total} ${t("audit.changes")}`,
          }}
          rowKey="id"
          size="small"
        />
      )}
    </Card>
  )
}
