export interface FileValidationConfig {
  maxSize: number // in bytes
  allowedTypes: string[]
  allowedExtensions: string[]
  minSize?: number
  maxFiles?: number
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export const FILE_VALIDATION_CONFIGS = {
  THESIS_DOCUMENT: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx"],
    minSize: 1024, // 1KB minimum
  },
  PRESENTATION: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/pdf",
    ],
    allowedExtensions: [".ppt", ".pptx", ".pdf"],
    minSize: 1024,
  },
  POSTER: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
    minSize: 1024,
  },
  SOURCE_CODE: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed"],
    allowedExtensions: [".zip", ".rar", ".7z"],
    minSize: 1024,
  },
  GENERAL: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt"],
    minSize: 1024,
  },
} as const

export const validateFile = (file: File, config: FileValidationConfig): FileValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  if (file.size > config.maxSize) {
    errors.push(`Kích thước file vượt quá giới hạn cho phép (${formatFileSize(config.maxSize)})`)
  }

  if (config.minSize && file.size < config.minSize) {
    errors.push(`Kích thước file quá nhỏ (tối thiểu ${formatFileSize(config.minSize)})`)
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(`Loại file không được hỗ trợ. Chỉ chấp nhận: ${config.allowedTypes.join(", ")}`)
  }

  // Check file extension
  const fileExtension = getFileExtension(file.name).toLowerCase()
  const allowedExtensions = config.allowedExtensions.map((ext) => ext.toLowerCase())

  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`Phần mở rộng file không được hỗ trợ. Chỉ chấp nhận: ${config.allowedExtensions.join(", ")}`)
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push("Tên file quá dài (tối đa 255 ký tự)")
  }

  // Check for potentially dangerous file names
  const dangerousPatterns = [/\.\./g, /[<>:"|?*]/g, /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i]
  if (dangerousPatterns.some((pattern) => pattern.test(file.name))) {
    errors.push("Tên file chứa ký tự không hợp lệ")
  }

  // Warnings for large files
  if (file.size > config.maxSize * 0.8) {
    warnings.push("File có kích thước lớn, có thể mất thời gian để tải lên")
  }

  // Warning for old file formats
  const oldFormats = [".doc", ".ppt", ".xls"]
  if (oldFormats.some((format) => file.name.toLowerCase().endsWith(format))) {
    warnings.push("Khuyến nghị sử dụng định dạng file mới hơn (.docx, .pptx, .xlsx)")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const validateMultipleFiles = (files: File[], config: FileValidationConfig): FileValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check number of files
  if (config.maxFiles && files.length > config.maxFiles) {
    errors.push(`Số lượng file vượt quá giới hạn cho phép (tối đa ${config.maxFiles} file)`)
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const maxTotalSize = config.maxSize * (config.maxFiles || 1)

  if (totalSize > maxTotalSize) {
    errors.push(`Tổng kích thước các file vượt quá giới hạn (${formatFileSize(maxTotalSize)})`)
  }

  // Check for duplicate file names
  const fileNames = files.map((f) => f.name.toLowerCase())
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index)

  if (duplicates.length > 0) {
    errors.push(`Có file trùng tên: ${[...new Set(duplicates)].join(", ")}`)
  }

  // Validate each file individually
  files.forEach((file, index) => {
    const result = validateFile(file, config)

    result.errors.forEach((error) => {
      errors.push(`File "${file.name}": ${error}`)
    })

    result.warnings.forEach((warning) => {
      warnings.push(`File "${file.name}": ${warning}`)
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const getValidationConfigBySubmissionType = (type: string): FileValidationConfig => {
  switch (type) {
    case "CHAPTER":
    case "DRAFT":
    case "FINAL":
      return FILE_VALIDATION_CONFIGS.THESIS_DOCUMENT
    case "PRESENTATION":
      return FILE_VALIDATION_CONFIGS.PRESENTATION
    case "POSTER":
      return FILE_VALIDATION_CONFIGS.POSTER
    case "SOURCE_CODE":
      return FILE_VALIDATION_CONFIGS.SOURCE_CODE
    default:
      return FILE_VALIDATION_CONFIGS.GENERAL
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".")
  return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex)
}

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/")
}

export const isPDFFile = (file: File): boolean => {
  return file.type === "application/pdf"
}

export const isDocumentFile = (file: File): boolean => {
  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]
  return documentTypes.includes(file.type)
}

export const generateFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!isImageFile(file)) {
      resolve(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export const sanitizeFileName = (fileName: string): string => {
  // Remove dangerous characters and normalize
  return fileName
    .replace(/[<>:"|?*]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase()
}
