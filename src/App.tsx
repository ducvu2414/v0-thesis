import type React from "react"
import { BrowserRouter } from "react-router-dom"
import { QueryProvider } from "./app/providers/QueryProvider"
import { I18nProvider } from "./app/providers/I18nProvider"
import { ThemeProvider } from "./app/providers/ThemeProvider"
import { AuthProvider } from "./app/providers/AuthProvider"
import { AppRouter } from "./app/router"

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
