import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <MainLayout>
      <section
        className="
          flex min-h-screen
          items-center justify-center
          px-6
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            mx-auto max-w-3xl
            text-center
          "
        >
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-zinc-500
            "
          >
            Error 404
          </p>

          <h1
            className="
              mt-6 text-7xl
              font-light tracking-tight
              md:text-8xl
            "
          >
            Page not found.
          </h1>

          <p
            className="
              mx-auto mt-8 max-w-xl
              text-lg leading-relaxed
              text-zinc-600
              dark:text-zinc-400
            "
          >
            The page you’re looking for doesn’t exist or may have been moved.
          </p>

          <div
            className="
              mt-12 flex flex-wrap
              items-center justify-center
              gap-4
            "
          >
            <Link to="/">
              <Button>Back Home</Button>
            </Link>

            <Link to="/explore">
              <Button variant="secondary">Explore Articles</Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </MainLayout>
  );
}
