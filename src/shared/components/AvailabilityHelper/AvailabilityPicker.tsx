"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, Button, TimePicker, DatePicker, Space, message } from "antd"
import { ClockCircleOutlined, CalendarOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons"
import dayjs, { type Dayjs } from "dayjs"
import { useTranslation } from "react-i18next"

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  userId?: string
  userName?: string
}

interface AvailabilityPickerProps {
  userId: string
  onSlotsChange: (slots: TimeSlot[]) => void
  existingSlots?: TimeSlot[]
  mode?: "select" | "manage"
  minDate?: Dayjs
  maxDate?: Dayjs
}

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  userId,
  onSlotsChange,
  existingSlots = [],
  mode = "manage",
  minDate = dayjs(),
  maxDate = dayjs().add(3, "month"),
}) => {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [startTime, setStartTime] = useState<Dayjs | null>(null)
  const [endTime, setEndTime] = useState<Dayjs | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(existingSlots)

  useEffect(() => {
    onSlotsChange(timeSlots)
  }, [timeSlots, onSlotsChange])

  const addTimeSlot = () => {
    if (!selectedDate || !startTime || !endTime) {
      message.warning(t("availability.selectAllFields"))
      return
    }

    if (endTime.isBefore(startTime)) {
      message.error(t("availability.endTimeAfterStart"))
      return
    }

    const newSlot: TimeSlot = {
      id: `${userId}-${selectedDate.format("YYYY-MM-DD")}-${startTime.format("HH:mm")}`,
      date: selectedDate.format("YYYY-MM-DD"),
      startTime: startTime.format("HH:mm"),
      endTime: endTime.format("HH:mm"),
      isAvailable: true,
      userId,
    }

    // Check for overlapping slots
    const hasOverlap = timeSlots.some(
      (slot) =>
        slot.date === newSlot.date &&
        ((startTime.format("HH:mm") >= slot.startTime && startTime.format("HH:mm") < slot.endTime) ||
          (endTime.format("HH:mm") > slot.startTime && endTime.format("HH:mm") <= slot.endTime) ||
          (startTime.format("HH:mm") <= slot.startTime && endTime.format("HH:mm") >= slot.endTime)),
    )

    if (hasOverlap) {
      message.error(t("availability.overlappingSlot"))
      return
    }

    setTimeSlots([...timeSlots, newSlot])
    setStartTime(null)
    setEndTime(null)
    message.success(t("availability.slotAdded"))
  }

  const removeTimeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== slotId))
    message.success(t("availability.slotRemoved"))
  }

  const toggleSlotAvailability = (slotId: string) => {
    setTimeSlots(timeSlots.map((slot) => (slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot)))
  }

  const getQuickTimeSlots = () => {
    if (!selectedDate) return []

    const commonSlots = [
      { start: "08:00", end: "10:00", label: t("availability.morning") },
      { start: "10:00", end: "12:00", label: t("availability.lateMorning") },
      { start: "14:00", end: "16:00", label: t("availability.afternoon") },
      { start: "16:00", end: "18:00", label: t("availability.lateAfternoon") },
    ]

    return commonSlots.filter((slot) => {
      const hasOverlap = timeSlots.some(
        (existingSlot) =>
          existingSlot.date === selectedDate.format("YYYY-MM-DD") &&
          ((slot.start >= existingSlot.startTime && slot.start < existingSlot.endTime) ||
            (slot.end > existingSlot.startTime && slot.end <= existingSlot.endTime)),
      )
      return !hasOverlap
    })
  }

  const addQuickSlot = (start: string, end: string) => {
    if (!selectedDate) return

    const newSlot: TimeSlot = {
      id: `${userId}-${selectedDate.format("YYYY-MM-DD")}-${start}`,
      date: selectedDate.format("YYYY-MM-DD"),
      startTime: start,
      endTime: end,
      isAvailable: true,
      userId,
    }

    setTimeSlots([...timeSlots, newSlot])
    message.success(t("availability.slotAdded"))
  }

  const groupedSlots = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    },
    {} as Record<string, TimeSlot[]>,
  )

  return (
    <div className="space-y-6">
      {mode === "manage" && (
        <Card title={t("availability.addTimeSlot")} className="mb-6">
          <Space direction="vertical" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <CalendarOutlined className="mr-2" />
                  {t("availability.selectDate")}
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  className="w-full"
                  placeholder={t("availability.selectDate")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <ClockCircleOutlined className="mr-2" />
                  {t("availability.startTime")}
                </label>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  format="HH:mm"
                  className="w-full"
                  placeholder={t("availability.startTime")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <ClockCircleOutlined className="mr-2" />
                  {t("availability.endTime")}
                </label>
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  format="HH:mm"
                  className="w-full"
                  placeholder={t("availability.endTime")}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button type="primary" onClick={addTimeSlot}>
                {t("availability.addSlot")}
              </Button>

              {selectedDate && getQuickTimeSlots().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">{t("availability.quickAdd")}:</span>
                  {getQuickTimeSlots().map((slot, index) => (
                    <Button key={index} size="small" onClick={() => addQuickSlot(slot.start, slot.end)}>
                      {slot.label} ({slot.start}-{slot.end})
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Space>
        </Card>
      )}

      <Card title={t("availability.yourAvailability")}>
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t("availability.noSlotsAdded")}</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSlots)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, slots]) => (
                <div key={date} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{dayjs(date).format("dddd, MMMM D, YYYY")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {slots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between p-3 rounded border ${
                            slot.isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {slot.isAvailable ? (
                              <CheckOutlined className="text-green-600" />
                            ) : (
                              <CloseOutlined className="text-red-600" />
                            )}
                            <span className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          {mode === "manage" && (
                            <div className="flex space-x-1">
                              <Button size="small" type="text" onClick={() => toggleSlotAvailability(slot.id)}>
                                {slot.isAvailable ? t("common.disable") : t("common.enable")}
                              </Button>
                              <Button size="small" type="text" danger onClick={() => removeTimeSlot(slot.id)}>
                                {t("common.remove")}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}
