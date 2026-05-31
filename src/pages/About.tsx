import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <MainLayout>
      <section
        className="
          relative
          overflow-hidden
          px-6 py-24
        "
      >
        <div
          className="
            mx-auto
            max-w-6xl
            text-center
          "
        >
          <p
            className="
    text-xs
    uppercase
    tracking-[0.4em]
    text-indigo-600
  "
          >
            ABOUT CHATTER
          </p>

          <h1
            className="
              mt-8
              text-5xl
              font-light
              leading-[0.95]
              md:text-7xl
            "
          >
            Thoughtful Writing.
            <br />
            Meaningful Conversations.
          </h1>

          <p
            className="
              mx-auto
              mt-10
              max-w-3xl
              text-lg
              leading-relaxed
              text-zinc-600
              dark:text-zinc-400
            "
          >
            Chatter is a modern publishing platform built for writers and
            readers who value depth, clarity, and authentic storytelling.
          </p>
        </div>
      </section>

      <section
        className="
    mx-auto
    max-w-5xl
    px-6 py-24
  "
      >
        <h2
          className="
      text-4xl
      font-light
      tracking-tight
    "
        >
          Our Mission
        </h2>

        <p
          className="
      mt-8
      text-lg
      leading-relaxed
      text-zinc-600
      dark:text-zinc-400
    "
        >
          In a world dominated by short form content and endless scrolling,
          Chatter exists to bring focus back to thoughtful ideas.
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
          I believe great writing deserves a beautiful home, meaningful
          engagement, and a community that values knowledge over noise.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <div
            className="
        rounded-3xl
        border border-zinc-200
        p-10
        transition
        hover:-translate-y-1
        dark:border-zinc-800
      "
          >
            <h3 className="text-2xl font-light">Write Freely</h3>

            <p
              className="
          mt-4
          leading-relaxed
          text-zinc-600
          dark:text-zinc-400
        "
            >
              Publish articles with a powerful markdown editor, image support,
              drafts, and a distraction-free writing experience.
            </p>
          </div>

          <div
            className="
        rounded-3xl
        border border-zinc-200
        p-10
        transition
        hover:-translate-y-1
        dark:border-zinc-800
      "
          >
            <h3 className="text-2xl font-light">Build Community</h3>

            <p
              className="
          mt-4
          leading-relaxed
          text-zinc-600
          dark:text-zinc-400
        "
            >
              Connect with readers through comments, likes, follows, bookmarks,
              and meaningful discussions.
            </p>
          </div>

          <div
            className="
        rounded-3xl
        border border-zinc-200
        p-10
        transition
        hover:-translate-y-1
        dark:border-zinc-800
      "
          >
            <h3 className="text-2xl font-light">Grow Your Audience</h3>

            <p
              className="
          mt-4
          leading-relaxed
          text-zinc-600
          dark:text-zinc-400
        "
            >
              Discover trending topics, understand your audience with analytics,
              and expand your reach.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2
          className="
      text-4xl
      font-light
      tracking-tight
    "
        >
          Looking Ahead
        </h2>

        <p
          className="
      mt-8
      text-lg
      leading-relaxed
      text-zinc-600
      dark:text-zinc-400
    "
        >
          Our vision is to become the home of thoughtful writing on the internet.
           A place where creators can share ideas, build audiences, and inspire
          meaningful conversations without being lost in the noise of
          traditional social media.
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
          I believe the future belongs to creators who value quality over
          quantity, depth over distraction, and community over algorithms.
        </p>
      </section>

      <section
        className="
    px-6 py-32
    text-center
  "
      >
        <div className="mx-auto max-w-4xl">
          <h2
            className="
        text-5xl
        font-light
        tracking-tight
      "
          >
            Ready to start writing?
          </h2>

          <p
            className="
        mx-auto
        mt-8
        max-w-2xl
        text-lg
        text-zinc-600
        dark:text-zinc-400
      "
          >
            Join readers and writers building meaningful conversations on
            Chatter.
          </p>

          <div
            className="
        mt-12
        flex
        flex-wrap
        justify-center
        gap-4
      "
          >
            <Link
              to="/write"
              className="
          rounded-full
          bg-gradient-to-r
          from-indigo-600
          to-purple-600
          px-8 py-4
          text-white
        "
            >
              Start Writing
            </Link>

            <Link
              to="/explore"
              className="
          rounded-full
          border
          border-zinc-300
          px-8 py-4
          dark:border-zinc-700
        "
            >
              Explore Articles
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
