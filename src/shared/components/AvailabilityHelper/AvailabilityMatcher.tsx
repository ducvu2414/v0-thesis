"use client"

import type React from "react"
import { useState } from "react"
import { Card, Button, Select, DatePicker, Space, Tag, Empty, Spin } from "antd"
import { UserOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons"
import dayjs, { type Dayjs } from "dayjs"
import { useTranslation } from "react-i18next"
import type { TimeSlot } from "./AvailabilityPicker"

interface User {
  id: string
  name: string
  role: string
}

interface AvailabilityMatcherProps {
  users: User[]
  onMatchFound: (matches: MatchResult[]) => void
  minDuration?: number // in minutes
  dateRange?: [Dayjs, Dayjs]
}

interface MatchResult {
  date: string
  startTime: string
  endTime: string
  availableUsers: User[]
  duration: number
}

export const AvailabilityMatcher: React.FC<AvailabilityMatcherProps> = ({
  users,
  onMatchFound,
  minDuration = 60,
  dateRange,
}) => {
  const { t } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])

  // Mock function to get user availability - in real app, this would be an API call
  const getUserAvailability = async (userId: string, date: string): Promise<TimeSlot[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Mock data - in real app, this would come from the API
    const mockSlots: TimeSlot[] = [
      {
        id: `${userId}-${date}-08:00`,
        date,
        startTime: "08:00",
        endTime: "10:00",
        isAvailable: true,
        userId,
        userName: users.find((u) => u.id === userId)?.name,
      },
      {
        id: `${userId}-${date}-14:00`,
        date,
        startTime: "14:00",
        endTime: "16:00",
        isAvailable: true,
        userId,
        userName: users.find((u) => u.id === userId)?.name,
      },
    ]

    return mockSlots
  }

  const findCommonAvailability = async () => {
    if (selectedUsers.length < 2 || !selectedDate) return

    setLoading(true)
    try {
      // Get availability for all selected users
      const userAvailabilities = await Promise.all(
        selectedUsers.map(async (userId) => {
          const slots = await getUserAvailability(userId, selectedDate.format("YYYY-MM-DD"))
          return { userId, slots }
        }),
      )

      // Find overlapping time slots
      const commonSlots: MatchResult[] = []
      const dateStr = selectedDate.format("YYYY-MM-DD")

      // Get all unique time ranges
      const allTimeRanges = new Set<string>()
      userAvailabilities.forEach(({ slots }) => {
        slots.forEach((slot) => {
          if (slot.isAvailable) {
            allTimeRanges.add(`${slot.startTime}-${slot.endTime}`)
          }
        })
      })

      // Check each time range for common availability
      Array.from(allTimeRanges).forEach((timeRange) => {
        const [startTime, endTime] = timeRange.split("-")
        const availableUsers: User[] = []

        selectedUsers.forEach((userId) => {
          const userSlots = userAvailabilities.find((ua) => ua.userId === userId)?.slots || []
          const hasSlot = userSlots.some(
            (slot) => slot.isAvailable && slot.startTime <= startTime && slot.endTime >= endTime,
          )

          if (hasSlot) {
            const user = users.find((u) => u.id === userId)
            if (user) availableUsers.push(user)
          }
        })

        // If all selected users are available for this slot
        if (availableUsers.length === selectedUsers.length) {
          const duration = dayjs(`${dateStr} ${endTime}`).diff(dayjs(`${dateStr} ${startTime}`), "minute")

          if (duration >= minDuration) {
            commonSlots.push({
              date: dateStr,
              startTime,
              endTime,
              availableUsers,
              duration,
            })
          }
        }
      })

      setMatches(commonSlots)
      onMatchFound(commonSlots)
    } catch (error) {
      console.error("Error finding common availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      <Card title={t("availability.findCommonTime")}>
        <Space direction="vertical" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <UserOutlined className="mr-2" />
                {t("availability.selectUsers")}
              </label>
              <Select
                mode="multiple"
                value={selectedUsers}
                onChange={setSelectedUsers}
                className="w-full"
                placeholder={t("availability.selectUsers")}
                options={users.map((user) => ({
                  value: user.id,
                  label: `${user.name} (${user.role})`,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <CalendarOutlined className="mr-2" />
                {t("availability.selectDate")}
              </label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full"
                placeholder={t("availability.selectDate")}
                disabledDate={
                  dateRange ? (current) => current && (current < dateRange[0] || current > dateRange[1]) : undefined
                }
              />
            </div>
          </div>

          <Button
            type="primary"
            onClick={findCommonAvailability}
            disabled={selectedUsers.length < 2 || !selectedDate}
            loading={loading}
          >
            {t("availability.findCommonTime")}
          </Button>
        </Space>
      </Card>

      {loading && (
        <Card>
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">{t("availability.searching")}</p>
          </div>
        </Card>
      )}

      {!loading && matches.length > 0 && (
        <Card title={t("availability.commonAvailability")}>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-lg">
                      <ClockCircleOutlined className="mr-2" />
                      {match.startTime} - {match.endTime}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("availability.duration")}: {formatDuration(match.duration)}
                    </p>
                  </div>
                  <Button type="primary" size="small">
                    {t("availability.scheduleHere")}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium">{t("availability.availableUsers")}:</span>
                  {match.availableUsers.map((user) => (
                    <Tag key={user.id} color="green">
                      {user.name} ({user.role})
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && selectedUsers.length >= 2 && selectedDate && matches.length === 0 && (
        <Card>
          <Empty description={t("availability.noCommonTime")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      )}
    </div>
  )
}
