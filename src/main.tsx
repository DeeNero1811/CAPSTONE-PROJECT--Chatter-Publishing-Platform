import React from "react"

import Lenis from "lenis"

import ReactDOM from "react-dom/client"

import { BrowserRouter } from "react-router-dom"

import {
  HelmetProvider,
} from "react-helmet-async"

import App from "./App"

import "./index.css"

import ThemeProvider from "./components/providers/ThemeProvider"

import { AuthProvider } from "./context/AuthContext"

import { Toaster } from "react-hot-toast"

const lenis = new Lenis()

function raf(time: number) {
  lenis.raf(time)

  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

ReactDOM.createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>

          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
)