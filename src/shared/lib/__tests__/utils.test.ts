import { describe, it, expect } from "vitest"
import {
  calculateFinalScore,
  canApplyBonus,
  applyBonus,
  formatDate,
  formatFileSize,
  isOverdue,
  truncateText,
  debounce,
} from "../utils"

describe("Final Score Calculator", () => {
  describe("calculateFinalScore", () => {
    it("should calculate average of three scores correctly", () => {
      expect(calculateFinalScore(8.0, 7.5, 9.0)).toBe(8.2)
      expect(calculateFinalScore(6.0, 6.0, 6.0)).toBe(6.0)
      expect(calculateFinalScore(10.0, 9.0, 8.0)).toBe(9.0)
    })

    it("should round to 1 decimal place", () => {
      expect(calculateFinalScore(8.33, 7.67, 9.0)).toBe(8.3)
      expect(calculateFinalScore(7.777, 8.333, 9.111)).toBe(8.4)
    })

    it("should handle edge cases", () => {
      expect(calculateFinalScore(0, 0, 0)).toBe(0)
      expect(calculateFinalScore(10, 10, 10)).toBe(10)
    })
  })

  describe("canApplyBonus", () => {
    it("should return true for scores >= threshold", () => {
      expect(canApplyBonus(5.0)).toBe(true)
      expect(canApplyBonus(8.5)).toBe(true)
      expect(canApplyBonus(10.0)).toBe(true)
    })

    it("should return false for scores < threshold", () => {
      expect(canApplyBonus(4.9)).toBe(false)
      expect(canApplyBonus(3.0)).toBe(false)
      expect(canApplyBonus(0)).toBe(false)
    })

    it("should work with custom threshold", () => {
      expect(canApplyBonus(7.0, 8.0)).toBe(false)
      expect(canApplyBonus(8.5, 8.0)).toBe(true)
    })
  })

  describe("applyBonus", () => {
    it("should add bonus to final score", () => {
      expect(applyBonus(8.0, 1.0)).toBe(9.0)
      expect(applyBonus(7.5, 0.5)).toBe(8.0)
    })

    it("should cap bonus at 2.0 maximum", () => {
      expect(applyBonus(8.0, 3.0)).toBe(10.0) // 8.0 + 2.0 (capped)
      expect(applyBonus(7.0, 2.5)).toBe(9.0) // 7.0 + 2.0 (capped)
    })

    it("should round result to 1 decimal place", () => {
      expect(applyBonus(8.33, 1.67)).toBe(10.0)
      expect(applyBonus(7.77, 1.33)).toBe(9.1)
    })
  })
})

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format date with default format", () => {
      const date = new Date("2024-03-15")
      expect(formatDate(date)).toBe("15/03/2024")
    })

    it("should format date with custom format", () => {
      const date = new Date("2024-03-15")
      expect(formatDate(date, "YYYY-MM-DD")).toBe("2024-03-15")
    })
  })

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes")
      expect(formatFileSize(1024)).toBe("1 KB")
      expect(formatFileSize(1048576)).toBe("1 MB")
      expect(formatFileSize(1073741824)).toBe("1 GB")
    })

    it("should handle decimal values", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB")
      expect(formatFileSize(2621440)).toBe("2.5 MB")
    })
  })

  describe("isOverdue", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString() // 1 day ago
      expect(isOverdue(pastDate)).toBe(true)
    })

    it("should return false for future dates", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString() // 1 day from now
      expect(isOverdue(futureDate)).toBe(false)
    })
  })

  describe("truncateText", () => {
    it("should truncate long text", () => {
      expect(truncateText("This is a very long text", 10)).toBe("This is a...")
    })

    it("should not truncate short text", () => {
      expect(truncateText("Short", 10)).toBe("Short")
    })
  })

  describe("debounce", () => {
    it("should debounce function calls", async () => {
      let callCount = 0
      const debouncedFn = debounce(() => callCount++, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(callCount).toBe(0)

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(callCount).toBe(1)
    })
  })
})
