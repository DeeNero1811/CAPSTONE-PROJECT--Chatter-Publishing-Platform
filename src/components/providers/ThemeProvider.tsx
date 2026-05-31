import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"
type Props = {
  children: ReactNode
}

export default function ThemeProvider({
  children,
}: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  )
}