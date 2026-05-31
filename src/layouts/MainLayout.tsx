import type { ReactNode } from "react"
import Navbar from "../components/layout/Navbar"

import Footer from "../components/layout/Footer"

type MainLayoutProps = {
  children: ReactNode
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <>
      {/* SKIP LINK */}
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:left-4
          focus:top-4
          focus:z-50
          rounded-full
          bg-black
          px-5 py-3
          text-sm text-white
          dark:bg-white
          dark:text-black
        "
      >
        Skip to content
      </a>

      <main
        className="
          min-h-screen
          bg-[#fafafa]
          text-[#111111]
          transition-colors
          dark:bg-black
          dark:text-white
        "
      >
        <header>
          <Navbar />
        </header>

        <section
          id="main-content"
          className="pt-16"
        >
          {children}
        </section>

        <footer>
          <Footer />
        </footer>
      </main>
    </>
  )
}