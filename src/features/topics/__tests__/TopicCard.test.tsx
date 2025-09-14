import type React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import TopicCard from "../components/TopicCard"
import type { Topic } from "../../../shared/types/topics"

const mockTopic: Topic = {
  id: "1",
  title: "Test Topic Title",
  description: "Test topic description",
  status: "APPROVED",
  type: "RESEARCH",
  studentId: "student1",
  supervisorId: "supervisor1",
  reviewerId: "reviewer1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  student: {
    id: "student1",
    name: "John Doe",
    email: "john@example.com",
    role: "STUDENT",
    studentId: "ST001",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  supervisor: {
    id: "supervisor1",
    name: "Dr. Smith",
    email: "smith@example.com",
    role: "SUPERVISOR",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
}

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  )
}

describe("TopicCard", () => {
  it("should render topic information correctly", () => {
    renderWithProviders(<TopicCard topic={mockTopic} />)

    expect(screen.getByText("Test Topic Title")).toBeInTheDocument()
    expect(screen.getByText("Test topic description")).toBeInTheDocument()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument()
  })

  it("should display correct status badge", () => {
    renderWithProviders(<TopicCard topic={mockTopic} />)

    expect(screen.getByText("Đã duyệt")).toBeInTheDocument()
  })

  it("should display topic type correctly", () => {
    renderWithProviders(<TopicCard topic={mockTopic} />)

    expect(screen.getByText("Nghiên cứu")).toBeInTheDocument()
  })

  it("should handle missing optional data gracefully", () => {
    const topicWithoutReviewer = { ...mockTopic, reviewer: undefined }

    renderWithProviders(<TopicCard topic={topicWithoutReviewer} />)

    expect(screen.getByText("Test Topic Title")).toBeInTheDocument()
    expect(screen.queryByText("Reviewer:")).not.toBeInTheDocument()
  })
})
