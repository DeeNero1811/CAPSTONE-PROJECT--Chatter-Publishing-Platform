import type { ReactNode } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#fafafa]
        text-[#111111]
        transition-colors
        dark:bg-black
        dark:text-white
      "
    >
      <Navbar />

      <div
        className="
          w-full
          max-w-full
          pt-16
        "
      >
        {children}
      </div>

      <Footer />
    </main>
  );
}
