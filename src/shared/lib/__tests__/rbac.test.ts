import { describe, it, expect } from "vitest"
import { hasPermission, hasAnyPermission, canAccessRoute, PERMISSIONS, ROLE_PERMISSIONS } from "../rbac"
import type { UserRole } from "../../types/auth"

describe("RBAC System", () => {
  describe("hasPermission", () => {
    it("should return true when user has the required permission", () => {
      expect(hasPermission("STUDENT", PERMISSIONS.TOPIC_READ)).toBe(true)
      expect(hasPermission("SUPERVISOR", PERMISSIONS.TOPIC_CREATE)).toBe(true)
      expect(hasPermission("ADMIN", PERMISSIONS.USER_MANAGE)).toBe(true)
    })

    it("should return false when user lacks the required permission", () => {
      expect(hasPermission("STUDENT", PERMISSIONS.TOPIC_CREATE)).toBe(false)
      expect(hasPermission("REVIEWER", PERMISSIONS.USER_MANAGE)).toBe(false)
      expect(hasPermission("COUNCIL_MEMBER", PERMISSIONS.TOPIC_APPROVE)).toBe(false)
    })

    it("should handle invalid roles gracefully", () => {
      expect(hasPermission("INVALID_ROLE" as UserRole, PERMISSIONS.TOPIC_READ)).toBe(false)
    })
  })

  describe("hasAnyPermission", () => {
    it("should return true when user has at least one permission", () => {
      const permissions = [PERMISSIONS.TOPIC_CREATE, PERMISSIONS.TOPIC_READ]
      expect(hasAnyPermission("STUDENT", permissions)).toBe(true) // Has TOPIC_READ
      expect(hasAnyPermission("SUPERVISOR", permissions)).toBe(true) // Has both
    })

    it("should return false when user has none of the permissions", () => {
      const permissions = [PERMISSIONS.USER_MANAGE, PERMISSIONS.ROLE_MANAGE]
      expect(hasAnyPermission("STUDENT", permissions)).toBe(false)
      expect(hasAnyPermission("REVIEWER", permissions)).toBe(false)
    })

    it("should handle empty permissions array", () => {
      expect(hasAnyPermission("ADMIN", [])).toBe(false)
    })
  })

  describe("canAccessRoute", () => {
    it("should allow access to routes with proper permissions", () => {
      expect(canAccessRoute("STUDENT", "/dashboard")).toBe(true)
      expect(canAccessRoute("SUPERVISOR", "/topics/create")).toBe(true)
      expect(canAccessRoute("HOD", "/reports")).toBe(true)
      expect(canAccessRoute("ADMIN", "/admin")).toBe(true)
    })

    it("should deny access to routes without proper permissions", () => {
      expect(canAccessRoute("STUDENT", "/topics/create")).toBe(false)
      expect(canAccessRoute("REVIEWER", "/reports")).toBe(false)
      expect(canAccessRoute("COUNCIL_MEMBER", "/admin")).toBe(false)
    })

    it("should allow access to undefined routes", () => {
      expect(canAccessRoute("STUDENT", "/undefined-route")).toBe(true)
    })
  })

  describe("Role Permissions Validation", () => {
    it("should have valid permissions for all roles", () => {
      const allRoles: UserRole[] = [
        "STUDENT",
        "SUPERVISOR",
        "REVIEWER",
        "COUNCIL_CHAIR",
        "COUNCIL_SECRETARY",
        "COUNCIL_MEMBER",
        "HOD",
        "ADMIN",
      ]

      allRoles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined()
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
      })
    })

    it("should ensure ADMIN has all permissions", () => {
      const allPermissions = Object.values(PERMISSIONS)
      const adminPermissions = ROLE_PERMISSIONS.ADMIN

      expect(adminPermissions).toEqual(allPermissions)
    })

    it("should ensure STUDENT has limited permissions", () => {
      const studentPermissions = ROLE_PERMISSIONS.STUDENT
      const restrictedPermissions = [
        PERMISSIONS.TOPIC_CREATE,
        PERMISSIONS.TOPIC_APPROVE,
        PERMISSIONS.USER_MANAGE,
        PERMISSIONS.ROLE_MANAGE,
      ]

      restrictedPermissions.forEach((permission) => {
        expect(studentPermissions).not.toContainEqual(permission)
      })
    })

    it("should ensure HOD can approve topics but not manage users", () => {
      const hodPermissions = ROLE_PERMISSIONS.HOD
      expect(hodPermissions).toContainEqual(PERMISSIONS.TOPIC_APPROVE)
      expect(hodPermissions).not.toContainEqual(PERMISSIONS.USER_MANAGE)
    })

    it("should ensure SUPERVISOR can create and update topics", () => {
      const supervisorPermissions = ROLE_PERMISSIONS.SUPERVISOR
      expect(supervisorPermissions).toContainEqual(PERMISSIONS.TOPIC_CREATE)
      expect(supervisorPermissions).toContainEqual(PERMISSIONS.TOPIC_UPDATE)
      expect(supervisorPermissions).not.toContainEqual(PERMISSIONS.TOPIC_APPROVE)
    })
  })

  describe("Permission Structure Validation", () => {
    it("should have consistent permission structure", () => {
      Object.values(PERMISSIONS).forEach((permission) => {
        expect(permission).toHaveProperty("resource")
        expect(permission).toHaveProperty("action")
        expect(typeof permission.resource).toBe("string")
        expect(typeof permission.action).toBe("string")
      })
    })

    it("should have unique permission combinations", () => {
      const permissionStrings = Object.values(PERMISSIONS).map((p) => `${p.resource}:${p.action}`)
      const uniquePermissions = new Set(permissionStrings)
      expect(uniquePermissions.size).toBe(permissionStrings.length)
    })
  })
})
