import MainLayout from "../layouts/MainLayout"

export default function Privacy() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-6 py-24">
        <p
          className="
            text-sm
            uppercase
            tracking-[0.3em]
            text-zinc-500
          "
        >
          Legal
        </p>

        <h1
          className="
            mt-6
            text-5xl
            font-light
            tracking-tight
          "
        >
          Privacy Policy
        </h1>

        <p
          className="
            mt-10
            text-lg
            leading-relaxed
            text-zinc-600
            dark:text-zinc-400
          "
        >
          Chatter respects your privacy.
          I collect only the information
          necessary to provide the
          platform, including account
          details, published content,
          and engagement activity such
          as likes, comments, follows,
          and bookmarks.
        </p>

        <p
          className="
            mt-6
            text-lg
            leading-relaxed
            text-zinc-600
            dark:text-zinc-400
          "
        >
          I do not sell personal data.
          Information collected through
          Chatter is used solely to
          improve the platform
          experience and provide core
          functionality.
        </p>

        <p
          className="
            mt-6
            text-lg
            leading-relaxed
            text-zinc-600
            dark:text-zinc-400
          "
        >
          Chatter is an educational and
          portfolio project created to
          demonstrate modern web
          development practices using
          React, TypeScript, Supabase.
        </p>
      </main>
    </MainLayout>
  )
}