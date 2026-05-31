import MainLayout from "../layouts/MainLayout";

export default function Terms() {
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
          Terms of Service
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
          By using Chatter, you agree to use the platform responsibly and
          respectfully. Users are responsible for the content they publish and
          share.
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
          Users retain ownership of their published content while granting
          Chatter permission to display and distribute that content through the
          platform.
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
          Chatter reserves the right to remove content that violates community
          standards, promotes harmful activity, or disrupts the experience of
          other users.
        </p>
      </main>
    </MainLayout>
  );
}
