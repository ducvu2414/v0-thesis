"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, message, Alert, List, Typography, Space, Tag } from "antd"
import { InboxOutlined, FileOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import type { UploadProps, UploadFile } from "antd"
import {
  validateFile,
  validateMultipleFiles,
  getValidationConfigBySubmissionType,
  formatFileSize,
  generateFilePreview,
  type FileValidationResult,
} from "@/shared/lib/fileValidation"

const { Dragger } = Upload
const { Text } = Typography

interface FileUploadValidatorProps {
  submissionType: string
  maxFiles?: number
  onFilesChange: (files: File[]) => void
  onValidationChange: (isValid: boolean, errors: string[], warnings: string[]) => void
  disabled?: boolean
  className?: string
}

export const FileUploadValidator: React.FC<FileUploadValidatorProps> = ({
  submissionType,
  maxFiles = 1,
  onFilesChange,
  onValidationChange,
  disabled = false,
  className,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [validationResult, setValidationResult] = useState<FileValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  })
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const config = getValidationConfigBySubmissionType(submissionType)
  const actualMaxFiles = Math.min(maxFiles, config.maxFiles || maxFiles)

  const validateFiles = useCallback(
    async (files: File[]) => {
      const result = validateMultipleFiles(files, { ...config, maxFiles: actualMaxFiles })

      setValidationResult(result)
      onValidationChange(result.isValid, result.errors, result.warnings)

      // Generate previews for image files
      const newPreviews: Record<string, string> = {}
      for (const file of files) {
        const preview = await generateFilePreview(file)
        if (preview) {
          newPreviews[file.name] = preview
        }
      }
      setPreviews(newPreviews)

      return result
    },
    [config, actualMaxFiles, onValidationChange],
  )

  const handleUploadChange: UploadProps["onChange"] = useCallback(
    async (info) => {
      const { fileList: newFileList } = info

      // Filter out files that failed validation
      const validFiles = newFileList.filter((file) => {
        if (file.originFileObj) {
          const singleResult = validateFile(file.originFileObj, config)
          return singleResult.isValid
        }
        return true
      })

      setFileList(validFiles)

      // Extract actual File objects
      const files = validFiles.map((file) => file.originFileObj).filter((file): file is File => file !== undefined)

      // Validate all files together
      await validateFiles(files)
      onFilesChange(files)
    },
    [config, validateFiles, onFilesChange],
  )

  const handleRemove = useCallback(
    (file: UploadFile) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid)
      setFileList(newFileList)

      const files = newFileList.map((item) => item.originFileObj).filter((file): file is File => file !== undefined)

      validateFiles(files)
      onFilesChange(files)

      // Remove preview
      if (file.name && previews[file.name]) {
        const newPreviews = { ...previews }
        delete newPreviews[file.name]
        setPreviews(newPreviews)
      }
    },
    [fileList, validateFiles, onFilesChange, previews],
  )

  const beforeUpload = useCallback(
    (file: File) => {
      const result = validateFile(file, config)

      if (!result.isValid) {
        result.errors.forEach((error) => {
          message.error(`${file.name}: ${error}`)
        })
        return false
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          message.warning(`${file.name}: ${warning}`)
        })
      }

      return false // Prevent automatic upload
    },
    [config],
  )

  const getAcceptedFileTypes = () => {
    return config.allowedExtensions.join(",")
  }

  const renderFileInfo = () => {
    if (fileList.length === 0) return null

    return (
      <div style={{ marginTop: 16 }}>
        <List
          size="small"
          dataSource={fileList}
          renderItem={(file) => (
            <List.Item
              actions={[
                previews[file.name!] && (
                  <EyeOutlined
                    key="preview"
                    onClick={() => {
                      const preview = previews[file.name!]
                      const newWindow = window.open()
                      if (newWindow) {
                        newWindow.document.write(`<img src="${preview}" style="max-width: 100%; height: auto;" />`)
                      }
                    }}
                  />
                ),
                <DeleteOutlined key="delete" onClick={() => handleRemove(file)} style={{ color: "#ff4d4f" }} />,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={
                  <Space>
                    <Text>{file.name}</Text>
                    <Tag color="blue">{formatFileSize(file.size || 0)}</Tag>
                  </Space>
                }
                description={<Text type="secondary">{file.type || "Unknown type"}</Text>}
              />
            </List.Item>
          )}
        />
      </div>
    )
  }

  const renderValidationMessages = () => {
    if (validationResult.errors.length === 0 && validationResult.warnings.length === 0) {
      return null
    }

    return (
      <div style={{ marginTop: 16 }}>
        {validationResult.errors.length > 0 && (
          <Alert
            type="error"
            message="Lỗi validation"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            style={{ marginBottom: 8 }}
          />
        )}

        {validationResult.warnings.length > 0 && (
          <Alert
            type="warning"
            message="Cảnh báo"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            }
          />
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <Dragger
        multiple={actualMaxFiles > 1}
        fileList={fileList}
        onChange={handleUploadChange}
        beforeUpload={beforeUpload}
        onRemove={handleRemove}
        accept={getAcceptedFileTypes()}
        disabled={disabled || fileList.length >= actualMaxFiles}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Nhấp hoặc kéo thả file vào khu vực này để tải lên</p>
        <p className="ant-upload-hint">
          Chấp nhận: {config.allowedExtensions.join(", ")} | Tối đa: {formatFileSize(config.maxSize)} | Số lượng:{" "}
          {actualMaxFiles} file
        </p>
      </Dragger>

      {renderFileInfo()}
      {renderValidationMessages()}
    </div>
  )
}
