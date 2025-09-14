import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date, format = "DD/MM/YYYY"): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format("DD/MM/YYYY HH:mm")
}

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow()
}

export const isOverdue = (deadline: string): boolean => {
  return dayjs().isAfter(dayjs(deadline))
}

export const getDaysUntilDeadline = (deadline: string): number => {
  return dayjs(deadline).diff(dayjs(), "day")
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const calculateFinalScore = (supervisorScore: number, reviewerScore: number, councilScore: number): number => {
  const average = (supervisorScore + reviewerScore + councilScore) / 3
  return Math.round(average * 10) / 10 // Round to 1 decimal place
}

export const canApplyBonus = (finalScore: number, threshold = 5): boolean => {
  return finalScore >= threshold
}

export const applyBonus = (finalScore: number, bonusScore: number): number => {
  const maxBonus = 2.0
  const actualBonus = Math.min(bonusScore, maxBonus)
  return Math.round((finalScore + actualBonus) * 10) / 10
}
