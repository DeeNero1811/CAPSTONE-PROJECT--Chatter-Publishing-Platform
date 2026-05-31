import type { ReactNode } from "react"
type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export default function Button({ children, variant = "primary" }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"
      : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

  return (
    <button className={`rounded-full px-6 py-3 transition ${styles}`}>
      {children}
    </button>
  );
}
