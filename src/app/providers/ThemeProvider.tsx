import type React from "react"
import { ConfigProvider, theme } from "antd"
import viVN from "antd/locale/vi_VN"
import enUS from "antd/locale/en_US"
import { useTranslation } from "react-i18next"

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()

  const locale = i18n.language === "vi" ? viVN : enUS

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: "#BFD2F8",
          colorPrimaryHover: "#93C5FD",
          colorPrimaryActive: "#60A5FA",
          borderRadius: 6,
          fontSize: 14,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}
