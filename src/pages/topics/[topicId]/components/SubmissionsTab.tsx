"use client"

import type React from "react"
import { useState } from "react"
import { Card, Button, Form, Input, Select, Space, Table, Tag, Typography, Modal, message } from "antd"
import { UploadOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { apiClient } from "@/shared/api/client"
import { formatDate, formatFileSize } from "@/shared/lib/utils"
import { FileUploadValidator } from "@/shared/components/FileUpload"
import type { Submission, SubmissionType } from "@/shared/types/submission"

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

interface SubmissionsTabProps {
  topicId: string
}

interface SubmissionFormData {
  type: SubmissionType
  note: string
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ topicId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isValidationValid, setIsValidationValid] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, reset, setValue } = useForm<SubmissionFormData>()
  const submissionType = watch("type")

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", topicId],
    queryFn: async () => {
      const response = await apiClient.get<Submission[]>(`/topics/${topicId}/submissions`)
      return response.data
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (data: SubmissionFormData) => {
      if (uploadFiles.length === 0) {
        throw new Error("Vui lòng chọn file để tải lên")
      }

      const formData = new FormData()
      formData.append("type", data.type)
      formData.append("note", data.note || "")
      formData.append("file", uploadFiles[0])

      const response = await apiClient.post(`/topics/${topicId}/submissions`, formData)
      return response.data
    },
    onSuccess: () => {
      message.success("Tải lên thành công!")
      queryClient.invalidateQueries({ queryKey: ["submissions", topicId] })
      setIsModalVisible(false)
      reset()
      setUploadFiles([])
    },
    onError: (error: any) => {
      message.error(error.message || "Có lỗi xảy ra khi tải lên")
    },
  })

  const getSubmissionTypeText = (type: SubmissionType) => {
    const texts: Record<SubmissionType, string> = {
      CHAPTER: "Chương",
      DRAFT: "Bản nháp",
      FINAL: "Bản cuối",
      POSTER: "Poster",
      PRESENTATION: "Thuyết trình",
    }
    return texts[type] || type
  }

  const getSubmissionTypeColor = (type: SubmissionType) => {
    const colors: Record<SubmissionType, string> = {
      CHAPTER: "blue",
      DRAFT: "orange",
      FINAL: "green",
      POSTER: "purple",
      PRESENTATION: "cyan",
    }
    return colors[type] || "default"
  }

  const handleFilesChange = (files: File[]) => {
    setUploadFiles(files)
  }

  const handleValidationChange = (isValid: boolean, errors: string[], warnings: string[]) => {
    setIsValidationValid(isValid)
    setValidationErrors(errors)
  }

  const onSubmit = (data: SubmissionFormData) => {
    if (!isValidationValid) {
      message.error("Vui lòng sửa các lỗi validation trước khi tải lên")
      return
    }
    uploadMutation.mutate(data)
  }

  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: SubmissionType) => <Tag color={getSubmissionTypeColor(type)}>{getSubmissionTypeText(type)}</Tag>,
    },
    {
      title: "File",
      dataIndex: "fileName",
      key: "fileName",
      render: (fileName: string, record: Submission) => (
        <Space>
          <Text>{fileName}</Text>
          <Text type="secondary">({formatFileSize(record.fileSize)})</Text>
        </Space>
      ),
    },
    {
      title: "Phiên bản",
      dataIndex: "version",
      key: "version",
      render: (version: number) => `v${version}`,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || "-",
    },
    {
      title: "Ngày tải lên",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Người tải",
      dataIndex: "uploadedByUser",
      key: "uploadedByUser",
      render: (user: any) => user?.name || "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record: Submission) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(record.fileUrl, "_blank")}>
            Xem
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => {
              const link = document.createElement("a")
              link.href = record.fileUrl
              link.download = record.fileName
              link.click()
            }}
          >
            Tải về
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Danh sách nộp bài"
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalVisible(true)}>
            Nộp bài mới
          </Button>
        }
      >
        <Table
          dataSource={submissions}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Nộp bài mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          reset()
          setUploadFiles([])
        }}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Loại nộp bài" required>
            <Select
              placeholder="Chọn loại nộp bài"
              {...register("type", { required: true })}
              onChange={(value) => setValue("type", value)}
            >
              <Option value="CHAPTER">Chương</Option>
              <Option value="DRAFT">Bản nháp</Option>
              <Option value="FINAL">Bản cuối</Option>
              <Option value="POSTER">Poster</Option>
              <Option value="PRESENTATION">Thuyết trình</Option>
            </Select>
          </Form.Item>

          <Form.Item label="File tải lên" required>
            <FileUploadValidator
              submissionType={submissionType || "GENERAL"}
              maxFiles={1}
              onFilesChange={handleFilesChange}
              onValidationChange={handleValidationChange}
              disabled={uploadMutation.isPending}
            />
          </Form.Item>

          <Form.Item label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" {...register("note")} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploadMutation.isPending}
                disabled={!isValidationValid || uploadFiles.length === 0}
              >
                Tải lên
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
