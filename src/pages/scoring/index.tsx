"use client"

import type React from "react"
import { useState } from "react"
import { Card, Typography, Table, Button, Modal, Form, InputNumber, Input, Select, Space, Tag } from "antd"
import { TrophyOutlined, EditOutlined } from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/api/client"
import { useAuth } from "@/app/providers/AuthProvider"
import { calculateFinalScore } from "@/shared/lib/utils"
import type { Topic } from "@/shared/types/topics"
import type { FinalScore } from "@/shared/types/scoring"

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

export const ScoringPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [form] = Form.useForm()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: topics = [] } = useQuery({
    queryKey: ["topics", "scoring"],
    queryFn: async () => {
      const response = await apiClient.get<Topic[]>("/topics", {
        status: "COMPLETED,DEFENDED",
      })
      return response.data
    },
  })

  const { data: finalScores = [] } = useQuery({
    queryKey: ["finalScores"],
    queryFn: async () => {
      const response = await apiClient.get<FinalScore[]>("/scoring/final")
      return response.data
    },
  })

  const columns = [
    {
      title: "Đề tài",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <div style={{ maxWidth: 300 }}>{text}</div>,
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
      title: "Điểm GVHD",
      key: "supervisorScore",
      render: (record: Topic) => {
        const finalScore = finalScores.find((fs) => fs.topicId === record.id)
        return finalScore?.supervisorScore?.toFixed(1) || "-"
      },
    },
    {
      title: "Điểm GVPB",
      key: "reviewerScore",
      render: (record: Topic) => {
        const finalScore = finalScores.find((fs) => fs.topicId === record.id)
        return finalScore?.reviewerScore?.toFixed(1) || "-"
      },
    },
    {
      title: "Điểm HĐ",
      key: "councilScore",
      render: (record: Topic) => {
        const finalScore = finalScores.find((fs) => fs.topicId === record.id)
        return finalScore?.councilScore?.toFixed(1) || "-"
      },
    },
    {
      title: "Điểm cuối",
      key: "finalScore",
      render: (record: Topic) => {
        const finalScore = finalScores.find((fs) => fs.topicId === record.id)
        if (!finalScore) return "-"

        return (
          <Tag color={finalScore.totalScore >= 8 ? "green" : finalScore.totalScore >= 6.5 ? "blue" : "orange"}>
            {finalScore.totalScore.toFixed(1)}
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record: Topic) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditScore(record)}>
          Chấm điểm
        </Button>
      ),
    },
  ]

  const handleEditScore = (topic: Topic) => {
    setSelectedTopic(topic)
    setIsModalVisible(true)

    const finalScore = finalScores.find((fs) => fs.topicId === topic.id)
    if (finalScore) {
      form.setFieldsValue({
        supervisorScore: finalScore.supervisorScore,
        reviewerScore: finalScore.reviewerScore,
        councilScore: finalScore.councilScore,
        bonusScore: finalScore.bonusScore,
        bonusReason: finalScore.bonusReason,
      })
    }
  }

  const saveScoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post(`/topics/${selectedTopic?.id}/scoring/final`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalScores"] })
      setIsModalVisible(false)
      form.resetFields()
      setSelectedTopic(null)
    },
  })

  const handleSubmit = (values: any) => {
    const finalScore = calculateFinalScore(values.supervisorScore, values.reviewerScore, values.councilScore)

    const scoreData = {
      ...values,
      finalScore,
      totalScore: finalScore + (values.bonusScore || 0),
    }

    saveScoreMutation.mutate(scoreData)
  }

  return (
    <div>
      <Title level={2}>
        <TrophyOutlined /> Chấm điểm khóa luận
      </Title>

      <Card>
        <Table
          dataSource={topics}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề tài`,
          }}
        />
      </Card>

      <Modal
        title={`Chấm điểm: ${selectedTopic?.title}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="supervisorScore"
            label="Điểm GVHD (0-10)"
            rules={[
              { required: true, message: "Vui lòng nhập điểm GVHD!" },
              { type: "number", min: 0, max: 10, message: "Điểm phải từ 0-10!" },
            ]}
          >
            <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="Nhập điểm GVHD..." />
          </Form.Item>

          <Form.Item
            name="reviewerScore"
            label="Điểm GVPB (0-10)"
            rules={[
              { required: true, message: "Vui lòng nhập điểm GVPB!" },
              { type: "number", min: 0, max: 10, message: "Điểm phải từ 0-10!" },
            ]}
          >
            <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="Nhập điểm GVPB..." />
          </Form.Item>

          <Form.Item
            name="councilScore"
            label="Điểm Hội đồng (0-10)"
            rules={[
              { required: true, message: "Vui lòng nhập điểm Hội đồng!" },
              { type: "number", min: 0, max: 10, message: "Điểm phải từ 0-10!" },
            ]}
          >
            <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="Nhập điểm Hội đồng..." />
          </Form.Item>

          <Form.Item
            name="bonusScore"
            label="Điểm thưởng (0-2)"
            rules={[{ type: "number", min: 0, max: 2, message: "Điểm thưởng tối đa 2!" }]}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: "100%" }} placeholder="Điểm thưởng (nếu có)..." />
          </Form.Item>

          <Form.Item name="bonusReason" label="Lý do thưởng điểm">
            <TextArea rows={3} placeholder="Nhập lý do thưởng điểm..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={saveScoreMutation.isPending}>
                Lưu điểm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
