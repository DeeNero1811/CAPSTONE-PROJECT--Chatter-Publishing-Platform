import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white transition dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Chatter</h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">
            A modern publishing platform for thoughtful writers and readers.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link to="/about">About</Link>

          <Link to="/privacy">Privacy</Link>

          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
