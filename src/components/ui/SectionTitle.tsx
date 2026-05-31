type SectionTitleProps = {
  title: string
}

export default function SectionTitle({
  title,
}: SectionTitleProps) {
  return (
    <h2 className="text-4xl font-light tracking-tight">
      {title}
    </h2>
  )
}