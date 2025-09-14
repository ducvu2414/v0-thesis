import type React from "react"
import { Card, Timeline, Tag, Typography, Space, Collapse, Table } from "antd"
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../../lib/utils"
import type { AuditLog, AuditAction, AuditEntityType } from "../../types/audit"

const { Text, Title } = Typography
const { Panel } = Collapse

interface AuditLogViewerProps {
  logs: AuditLog[]
  entityType?: AuditEntityType
  entityId?: string
  showEntityInfo?: boolean
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  entityType,
  entityId,
  showEntityInfo = true,
}) => {
  const { t } = useTranslation()

  const getActionIcon = (action: AuditAction) => {
    const iconMap = {
      CREATE: <PlusOutlined className="text-green-600" />,
      UPDATE: <EditOutlined className="text-blue-600" />,
      DELETE: <DeleteOutlined className="text-red-600" />,
      APPROVE: <CheckCircleOutlined className="text-green-600" />,
      REJECT: <CloseCircleOutlined className="text-red-600" />,
      SUBMIT: <PlusOutlined className="text-blue-600" />,
      SCORE_CHANGE: <EditOutlined className="text-orange-600" />,
    }
    return iconMap[action] || <EditOutlined />
  }

  const getActionColor = (action: AuditAction) => {
    const colorMap = {
      CREATE: "green",
      UPDATE: "blue",
      DELETE: "red",
      APPROVE: "green",
      REJECT: "red",
      SUBMIT: "blue",
      SCORE_CHANGE: "orange",
    }
    return colorMap[action] || "default"
  }

  const getActionText = (action: AuditAction) => {
    const textMap = {
      CREATE: t("audit.actions.create"),
      UPDATE: t("audit.actions.update"),
      DELETE: t("audit.actions.delete"),
      APPROVE: t("audit.actions.approve"),
      REJECT: t("audit.actions.reject"),
      SUBMIT: t("audit.actions.submit"),
      SCORE_CHANGE: t("audit.actions.scoreChange"),
    }
    return textMap[action] || action
  }

  const getEntityTypeText = (type: AuditEntityType) => {
    const textMap = {
      TOPIC: t("audit.entities.topic"),
      SUBMISSION: t("audit.entities.submission"),
      SCORE: t("audit.entities.score"),
      SCHEDULE: t("audit.entities.schedule"),
      USER: t("audit.entities.user"),
      REVIEW: t("audit.entities.review"),
    }
    return textMap[type] || type
  }

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? t("common.yes") : t("common.no")
    if (typeof value === "number") return value.toString()
    return String(value)
  }

  const changesColumns = [
    {
      title: t("audit.field"),
      dataIndex: "field",
      key: "field",
      render: (field: string) => <Text strong>{field}</Text>,
    },
    {
      title: t("audit.oldValue"),
      dataIndex: "oldValue",
      key: "oldValue",
      render: (value: any) => (
        <Text type="secondary" delete>
          {formatChangeValue(value)}
        </Text>
      ),
    },
    {
      title: t("audit.newValue"),
      dataIndex: "newValue",
      key: "newValue",
      render: (value: any) => <Text type="success">{formatChangeValue(value)}</Text>,
    },
    {
      title: t("audit.reason"),
      dataIndex: "changeReason",
      key: "changeReason",
      render: (reason: string) => reason || "-",
    },
  ]

  const filteredLogs =
    entityType && entityId ? logs.filter((log) => log.entityType === entityType && log.entityId === entityId) : logs

  if (filteredLogs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">{t("audit.noLogs")}</div>
      </Card>
    )
  }

  return (
    <Card title={t("audit.title")} className="audit-log-viewer">
      <Timeline>
        {filteredLogs.map((log) => (
          <Timeline.Item key={log.id} dot={getActionIcon(log.action)} color={getActionColor(log.action)}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Space>
                  <Tag color={getActionColor(log.action)}>{getActionText(log.action)}</Tag>
                  {showEntityInfo && <Tag color="default">{getEntityTypeText(log.entityType)}</Tag>}
                </Space>
                <Text type="secondary" className="text-sm">
                  {formatDateTime(log.timestamp)}
                </Text>
              </div>

              <div className="flex items-center space-x-2">
                <UserOutlined className="text-gray-400" />
                <Text strong>{log.userName}</Text>
                <Text type="secondary">({log.userRole})</Text>
              </div>

              {log.changes && log.changes.length > 0 && (
                <Collapse ghost>
                  <Panel header={`${t("audit.viewChanges")} (${log.changes.length})`} key={log.id}>
                    <Table
                      dataSource={log.changes}
                      columns={changesColumns}
                      pagination={false}
                      size="small"
                      rowKey={(record, index) => `${log.id}-${index}`}
                    />
                  </Panel>
                </Collapse>
              )}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <Text type="secondary" className="text-sm">
                    {t("audit.additionalInfo")}:
                  </Text>
                  <div className="mt-1">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <Text strong>{key}:</Text> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  )
}
