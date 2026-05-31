type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div
      className="
        min-w-0
        w-full
        overflow-hidden
        rounded-3xl
        border border-zinc-200
        bg-white p-8
        transition duration-300
        hover:-translate-y-2
        hover:border-indigo-400/40
        hover:shadow-2xl
        dark:border-zinc-800
        dark:bg-zinc-900
      "
    >
      {children}
    </div>
  );
}
