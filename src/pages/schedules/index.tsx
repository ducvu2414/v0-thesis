"use client"

import type React from "react"
import { useState } from "react"
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker, Space } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/api/client"
import { useAuth } from "@/app/providers/AuthProvider"
import type { ScheduleEvent, CreateEventRequest } from "@/shared/types/schedule"

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

export const SchedulesPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: events = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const response = await apiClient.get<ScheduleEvent[]>("/schedules")
      return response.data
    },
  })

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const response = await apiClient.post("/schedules", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      setIsModalVisible(false)
      form.resetFields()
    },
  })

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    backgroundColor: getEventColor(event.type),
    borderColor: getEventColor(event.type),
  }))

  function getEventColor(type: string) {
    const colors: Record<string, string> = {
      TRIAL_PRESENTATION: "#1890ff",
      REVIEW_MEETING: "#52c41a",
      COUNCIL_DEFENSE: "#722ed1",
      POSTER_SESSION: "#fa8c16",
    }
    return colors[type] || "#d9d9d9"
  }

  const handleDateSelect = (selectInfo: any) => {
    setIsModalVisible(true)
    form.setFieldsValue({
      startTime: selectInfo.start,
      endTime: selectInfo.end,
    })
  }

  const handleSubmit = (values: any) => {
    const eventData: CreateEventRequest = {
      ...values,
      startTime: values.dateRange[0].toISOString(),
      endTime: values.dateRange[1].toISOString(),
      topicIds: values.topicIds || [],
      participantIds: values.participantIds || [],
    }

    createEventMutation.mutate(eventData)
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2}>Lịch trình</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Tạo sự kiện
        </Button>
      </div>

      <Card>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          select={handleDateSelect}
          height="auto"
          locale="vi"
        />
      </Card>

      <Modal
        title="Tạo sự kiện mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề sự kiện"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại sự kiện"
            rules={[{ required: true, message: "Vui lòng chọn loại sự kiện!" }]}
          >
            <Select placeholder="Chọn loại sự kiện...">
              <Option value="TRIAL_PRESENTATION">Báo cáo thử</Option>
              <Option value="REVIEW_MEETING">Họp phản biện</Option>
              <Option value="COUNCIL_DEFENSE">Bảo vệ hội đồng</Option>
              <Option value="POSTER_SESSION">Poster session</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="location" label="Địa điểm">
            <Input placeholder="Nhập địa điểm..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết về sự kiện..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createEventMutation.isPending}>
                Tạo sự kiện
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
