import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import "./index.css"

// Start MSW in development
if (import.meta.env.DEV) {
  import("./shared/api/msw/browser").then(({ worker }) => {
    worker.start({
      onUnhandledRequest: "bypass",
    })
  })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
