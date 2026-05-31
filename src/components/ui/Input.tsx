type InputProps = {
  type?: string
  placeholder: string
}

export default function Input({
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="
        w-full rounded-2xl border border-zinc-300
        bg-white px-4 py-3 outline-none transition
        placeholder:text-zinc-400
        focus:border-black
        dark:border-zinc-700
        dark:bg-zinc-900
        dark:text-white
        dark:focus:border-white
      "
    />
  )
}