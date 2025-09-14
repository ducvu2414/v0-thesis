import type React from "react"
import { Button, Dropdown } from "antd"
import { GlobalOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
    localStorage.setItem("language", language)
  }

  const languageItems = [
    {
      key: "vi",
      label: "Tiếng Việt",
      onClick: () => handleLanguageChange("vi"),
    },
    {
      key: "en",
      label: "English",
      onClick: () => handleLanguageChange("en"),
    },
  ]

  return (
    <Dropdown menu={{ items: languageItems }} placement="bottomRight">
      <Button type="text" icon={<GlobalOutlined />} />
    </Dropdown>
  )
}
