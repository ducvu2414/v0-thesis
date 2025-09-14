import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export interface ExportData {
  totalTopics: number
  topicsByStatus: Record<string, number>
  averageScore: number
  defenseTypeDistribution: Record<string, number>
  completionRate: number
}

export const exportToCSV = (data: ExportData, filename = "thesis-report") => {
  const csvContent = [
    ["Metric", "Value"],
    ["Total Topics", data.totalTopics.toString()],
    ["Average Score", data.averageScore.toString()],
    ["Completion Rate (%)", data.completionRate.toString()],
    [""],
    ["Status Distribution", ""],
    ...Object.entries(data.topicsByStatus).map(([status, count]) => [getStatusText(status), count.toString()]),
    [""],
    ["Defense Type Distribution", ""],
    ...Object.entries(data.defenseTypeDistribution).map(([type, count]) => [
      type === "POSTER" ? "Poster" : "Council",
      count.toString(),
    ]),
  ]

  const csvString = csvContent.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const exportToPDF = async (elementId: string, filename = "thesis-report") => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error("Element not found")
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export const exportTopicsToCSV = (topics: any[], filename = "topics-list") => {
  const csvContent = [
    ["ID", "Title", "Student", "Supervisor", "Status", "Department", "Created Date", "Updated Date"],
    ...topics.map((topic) => [
      topic.id,
      topic.title,
      topic.student?.name || "",
      topic.supervisor?.name || "",
      getStatusText(topic.status),
      topic.department || "",
      new Date(topic.createdAt).toLocaleDateString("vi-VN"),
      new Date(topic.updatedAt).toLocaleDateString("vi-VN"),
    ]),
  ]

  const csvString = csvContent.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    IN_PROGRESS: "Đang thực hiện",
    COMPLETED: "Hoàn thành",
    DEFENDED: "Đã bảo vệ",
  }
  return texts[status] || status
}
