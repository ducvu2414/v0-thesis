"use client"

import type React from "react"
import { useEffect } from "react"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// Import translations
import viTranslations from "@/shared/locales/vi/common.json"
import enTranslations from "@/shared/locales/en/common.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viTranslations,
      },
      en: {
        common: enTranslations,
      },
    },
    fallbackLng: "vi",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  })

interface I18nProviderProps {
  children: React.ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Set initial language
    const savedLanguage = localStorage.getItem("language") || "vi"
    i18n.changeLanguage(savedLanguage)
  }, [])

  return <>{children}</>
}

export { i18n }
