import { http, HttpResponse } from "msw"
import { seedData } from "./seedData"
import type { LoginCredentials, LoginResponse } from "../../types/auth"
import type { CreateTopicRequest, UpdateTopicRequest } from "../../types/topics"

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const credentials = (await request.json()) as LoginCredentials

    const user = seedData.users.find((u) => u.email === credentials.email)
    if (!user) {
      return HttpResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const token = `mock_token_${user.id}`
    const response: LoginResponse = { user, token }

    return HttpResponse.json({
      success: true,
      data: response,
      message: "Login successful",
    })
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({
      success: true,
      message: "Logout successful",
    })
  }),

  // Global search endpoint
  http.get("/api/search", ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get("q")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    if (!query?.trim()) {
      return HttpResponse.json({
        success: true,
        data: [],
      })
    }

    const searchLower = query.toLowerCase()
    const results = []

    // Search topics
    const matchingTopics = seedData.topics
      .filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchLower) || topic.description?.toLowerCase().includes(searchLower),
      )
      .map((topic) => ({
        id: topic.id,
        type: "topic",
        title: topic.title,
        subtitle: `Sinh viên: ${seedData.users.find((u) => u.id === topic.studentId)?.name}`,
        description: topic.description,
        status: topic.status,
        url: `/topics/${topic.id}`,
      }))

    // Search users
    const matchingUsers = seedData.users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.profile?.studentId?.toLowerCase().includes(searchLower),
      )
      .map((user) => ({
        id: user.id,
        type: "user",
        title: user.name,
        subtitle: user.role === "STUDENT" ? `MSSV: ${user.profile?.studentId}` : user.role,
        description: user.email,
        url: `/users/${user.id}`,
      }))

    // Search schedule events
    const matchingEvents = seedData.scheduleEvents
      .filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower),
      )
      .map((event) => ({
        id: event.id,
        type: "schedule",
        title: event.title,
        subtitle: event.type,
        description: `${event.location} - ${new Date(event.startTime).toLocaleDateString("vi-VN")}`,
        url: `/schedules/${event.id}`,
      }))

    results.push(...matchingTopics, ...matchingUsers, ...matchingEvents)

    return HttpResponse.json({
      success: true,
      data: results.slice(0, limit),
    })
  }),

  // Users endpoints
  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get("role")
    const department = url.searchParams.get("department")

    let users = seedData.users
    if (role) users = users.filter((u) => u.role === role)
    if (department) users = users.filter((u) => u.profile.department === department)

    return HttpResponse.json({
      success: true,
      data: users,
    })
  }),

  http.get("/api/users/:id", ({ params }) => {
    const user = seedData.users.find((u) => u.id === params.id)
    if (!user) {
      return HttpResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: user,
    })
  }),

  // Topics endpoints
  http.get("/api/topics", ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const department = url.searchParams.get("department")
    const supervisorId = url.searchParams.get("supervisorId")
    const studentId = url.searchParams.get("studentId")
    const search = url.searchParams.get("search")

    let topics = seedData.topics.map((topic) => ({
      ...topic,
      student: seedData.users.find((u) => u.id === topic.studentId),
      supervisor: seedData.users.find((u) => u.id === topic.supervisorId),
      reviewers: topic.reviewerIds.map((id) => seedData.users.find((u) => u.id === id)).filter(Boolean),
      revisions: seedData.topicRevisions.filter((r) => r.topicId === topic.id),
    }))

    if (status) topics = topics.filter((t) => t.status === status)
    if (department) topics = topics.filter((t) => t.department === department)
    if (supervisorId) topics = topics.filter((t) => t.supervisorId === supervisorId)
    if (studentId) topics = topics.filter((t) => t.studentId === studentId)
    if (search) {
      const searchLower = search.toLowerCase()
      topics = topics.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.student?.name.toLowerCase().includes(searchLower) ||
          t.supervisor?.name.toLowerCase().includes(searchLower),
      )
    }

    return HttpResponse.json({
      success: true,
      data: topics,
    })
  }),

  http.get("/api/topics/:id", ({ params }) => {
    const topic = seedData.topics.find((t) => t.id === params.id)
    if (!topic) {
      return HttpResponse.json({ success: false, message: "Topic not found" }, { status: 404 })
    }

    const enrichedTopic = {
      ...topic,
      student: seedData.users.find((u) => u.id === topic.studentId),
      supervisor: seedData.users.find((u) => u.id === topic.supervisorId),
      reviewers: topic.reviewerIds.map((id) => seedData.users.find((u) => u.id === id)).filter(Boolean),
      revisions: seedData.topicRevisions.filter((r) => r.topicId === topic.id),
    }

    return HttpResponse.json({
      success: true,
      data: enrichedTopic,
    })
  }),

  http.post("/api/topics", async ({ request }) => {
    const data = (await request.json()) as CreateTopicRequest

    const newTopic = {
      id: `topic_${Date.now()}`,
      ...data,
      status: "PENDING" as const,
      reviewerIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    seedData.topics.push(newTopic)

    return HttpResponse.json({
      success: true,
      data: newTopic,
      message: "Topic created successfully",
    })
  }),

  http.put("/api/topics/:id", async ({ params, request }) => {
    const data = (await request.json()) as UpdateTopicRequest
    const topicIndex = seedData.topics.findIndex((t) => t.id === params.id)

    if (topicIndex === -1) {
      return HttpResponse.json({ success: false, message: "Topic not found" }, { status: 404 })
    }

    seedData.topics[topicIndex] = {
      ...seedData.topics[topicIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({
      success: true,
      data: seedData.topics[topicIndex],
      message: "Topic updated successfully",
    })
  }),

  // Progress endpoints
  http.get("/api/topics/:id/progress", ({ params }) => {
    const milestones = seedData.progressMilestones.filter((m) => m.topicId === params.id)
    return HttpResponse.json({
      success: true,
      data: milestones,
    })
  }),

  // Submissions endpoints
  http.get("/api/topics/:id/submissions", ({ params }) => {
    const submissions = seedData.submissions
      .filter((s) => s.topicId === params.id)
      .map((s) => ({
        ...s,
        uploadedByUser: seedData.users.find((u) => u.id === s.uploadedBy),
      }))

    return HttpResponse.json({
      success: true,
      data: submissions,
    })
  }),

  http.post("/api/topics/:id/submissions", async ({ params, request }) => {
    const formData = await request.formData()
    const type = formData.get("type") as string
    const note = formData.get("note") as string
    const file = formData.get("file") as File

    const existingSubmissions = seedData.submissions.filter((s) => s.topicId === params.id && s.type === type)
    const version = existingSubmissions.length + 1

    const newSubmission = {
      id: `submission_${Date.now()}`,
      topicId: params.id as string,
      type: type as any,
      version,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: `/uploads/${file.name}`,
      note,
      uploadedBy: "current_user_id",
      uploadedAt: new Date().toISOString(),
    }

    seedData.submissions.push(newSubmission)

    return HttpResponse.json({
      success: true,
      data: newSubmission,
      message: "Submission uploaded successfully",
    })
  }),

  // Reviews endpoints
  http.get("/api/topics/:id/reviews", ({ params }) => {
    const reviews = seedData.reviews
      .filter((r) => r.topicId === params.id)
      .map((r) => ({
        ...r,
        reviewer: seedData.users.find((u) => u.id === r.reviewerId),
      }))

    return HttpResponse.json({
      success: true,
      data: reviews,
    })
  }),

  // Schedules endpoints
  http.get("/api/schedules", ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get("start")
    const end = url.searchParams.get("end")

    let events = seedData.scheduleEvents.map((event) => ({
      ...event,
      topics: event.topicIds.map((id) => seedData.topics.find((t) => t.id === id)).filter(Boolean),
      participants: event.participantIds.map((id) => seedData.users.find((u) => u.id === id)).filter(Boolean),
      createdByUser: seedData.users.find((u) => u.id === event.createdBy),
    }))

    if (start && end) {
      events = events.filter((e) => e.startTime >= start && e.endTime <= end)
    }

    return HttpResponse.json({
      success: true,
      data: events,
    })
  }),

  // Scoring endpoints
  http.get("/api/rubrics", ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get("type")

    let rubrics = seedData.rubrics
    if (type) rubrics = rubrics.filter((r) => r.type === type)

    return HttpResponse.json({
      success: true,
      data: rubrics,
    })
  }),

  http.get("/api/topics/:id/scoring/:type", ({ params }) => {
    const scores = seedData.scoreSheets
      .filter((s) => s.topicId === params.id && s.type === params.type)
      .map((s) => ({
        ...s,
        scorer: seedData.users.find((u) => u.id === s.scorerId),
        rubric: seedData.rubrics.find((r) => r.id === s.rubricId),
      }))

    return HttpResponse.json({
      success: true,
      data: scores,
    })
  }),

  // Reports endpoints
  http.get("/api/reports/overview", () => {
    const totalTopics = seedData.topics.length
    const topicsByStatus = seedData.topics.reduce(
      (acc, topic) => {
        acc[topic.status] = (acc[topic.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const averageScore =
      seedData.finalScores.reduce((sum, score) => sum + score.totalScore, 0) / seedData.finalScores.length

    return HttpResponse.json({
      success: true,
      data: {
        totalTopics,
        topicsByStatus,
        averageScore: Math.round(averageScore * 10) / 10,
        defenseTypeDistribution: {
          POSTER: seedData.topics.filter((t) => t.defenseType === "POSTER").length,
          COUNCIL: seedData.topics.filter((t) => t.defenseType === "COUNCIL").length,
        },
      },
    })
  }),

  // Notifications endpoints
  http.get("/api/notifications", ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    let notifications = seedData.notifications
    if (userId) notifications = notifications.filter((n) => n.userId === userId)

    return HttpResponse.json({
      success: true,
      data: notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    })
  }),

  http.patch("/api/notifications/:id/read", ({ params }) => {
    const notificationIndex = seedData.notifications.findIndex((n) => n.id === params.id)

    if (notificationIndex === -1) {
      return HttpResponse.json({ success: false, message: "Notification not found" }, { status: 404 })
    }

    seedData.notifications[notificationIndex].isRead = true

    return HttpResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  }),

  http.delete("/api/notifications/:id", ({ params }) => {
    const notificationIndex = seedData.notifications.findIndex((n) => n.id === params.id)

    if (notificationIndex === -1) {
      return HttpResponse.json({ success: false, message: "Notification not found" }, { status: 404 })
    }

    seedData.notifications.splice(notificationIndex, 1)

    return HttpResponse.json({
      success: true,
      message: "Notification deleted",
    })
  }),

  http.patch("/api/notifications/mark-all-read", async ({ request }) => {
    const { userId } = (await request.json()) as { userId: string }

    seedData.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true))

    return HttpResponse.json({
      success: true,
      message: "All notifications marked as read",
    })
  }),
]
