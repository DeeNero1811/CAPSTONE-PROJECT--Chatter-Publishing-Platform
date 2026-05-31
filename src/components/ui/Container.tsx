import type { ReactNode } from "react"
type ContainerProps = {
  children: ReactNode
}

export default function Container({
  children,
}: ContainerProps) {
  return (
    <div className="mx-auto max-w-7xl px-6">
      {children}
    </div>
  )
}