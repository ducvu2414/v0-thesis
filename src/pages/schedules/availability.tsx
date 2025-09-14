"use client"

import type React from "react"
import { useState } from "react"
import { Card, Tabs, Button, Space } from "antd"
import { CalendarOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { AvailabilityPicker, AvailabilityMatcher, type TimeSlot } from "../../shared/components/AvailabilityHelper"
import { useAuth } from "../../app/providers/AuthProvider"

const { TabPane } = Tabs

// Mock users data - in real app, this would come from API
const mockUsers = [
  { id: "1", name: "Dr. Nguyễn Văn A", role: "Supervisor" },
  { id: "2", name: "Dr. Trần Thị B", role: "Reviewer" },
  { id: "3", name: "Prof. Lê Văn C", role: "Council Member" },
  { id: "4", name: "Dr. Phạm Thị D", role: "Reviewer" },
]

export const AvailabilityPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [mySlots, setMySlots] = useState<TimeSlot[]>([])
  const [commonMatches, setCommonMatches] = useState<any[]>([])

  const handleSaveAvailability = async () => {
    // In real app, this would save to API
    console.log("Saving availability:", mySlots)
  }

  const handleScheduleMatch = (match: any) => {
    // In real app, this would create a schedule event
    console.log("Scheduling match:", match)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("availability.title")}</h1>
        <p className="text-gray-600">{t("availability.description")}</p>
      </div>

      <Tabs defaultActiveKey="my-availability" className="bg-white rounded-lg">
        <TabPane
          tab={
            <span>
              <CalendarOutlined />
              {t("availability.myAvailability")}
            </span>
          }
          key="my-availability"
        >
          <div className="p-6">
            <AvailabilityPicker userId={user?.id || ""} onSlotsChange={setMySlots} mode="manage" />

            <div className="mt-6 flex justify-end">
              <Space>
                <Button onClick={() => setMySlots([])}>{t("common.clear")}</Button>
                <Button type="primary" onClick={handleSaveAvailability}>
                  {t("availability.saveAvailability")}
                </Button>
              </Space>
            </div>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined />
              {t("availability.findCommonTime")}
            </span>
          }
          key="find-common"
        >
          <div className="p-6">
            <AvailabilityMatcher users={mockUsers} onMatchFound={setCommonMatches} minDuration={60} />
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ClockCircleOutlined />
              {t("availability.scheduledMeetings")}
            </span>
          }
          key="scheduled"
        >
          <div className="p-6">
            <Card>
              <div className="text-center py-8 text-gray-500">{t("availability.noScheduledMeetings")}</div>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AvailabilityPage
