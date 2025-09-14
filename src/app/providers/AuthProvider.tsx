"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"
import { apiClient } from "@/shared/api/client"
import type { AuthState, LoginCredentials, LoginResponse } from "@/shared/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  })

  const queryClient = useQueryClient()

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userStr = localStorage.getItem("auth_user")

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        })
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }
  }, [])

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials)
      return response.data
    },
    onSuccess: (data) => {
      const { user, token } = data

      localStorage.setItem("auth_token", token)
      localStorage.setItem("auth_user", JSON.stringify(user))

      setAuthState({
        user,
        token,
        isAuthenticated: true,
      })

      message.success("Đăng nhập thành công!")
    },
    onError: (error: any) => {
      message.error(error.message || "Đăng nhập thất bại!")
    },
  })

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    })

    queryClient.clear()
    message.success("Đăng xuất thành công!")
  }

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials)
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    isLoading: loginMutation.isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
