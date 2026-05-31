import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Button from "../components/ui/Button";

import Card from "../components/ui/Card";

import { useAuth } from "../context/AuthContext";

import { supabase } from "../lib/supabase";

type Post = {
  id: string;
  title: string;
  content: string;
  views?: number;
  likes_count?: number;
  created_at: string;
  author_username?: string;
  category?: string;
  cover_image?: string;
};

type Writer = {
  username: string;
  avatar_url?: string;
};

function stripMarkdown(text: string) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#_*>\-\[\]`]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

function calculateReadingTime(text: string) {
  const words = text.split(/\s+/).length;

  return Math.max(1, Math.ceil(words / 200));
}

export default function Home() {
  const { user } = useAuth();

  const [heroPost, setHeroPost] = useState<Post | null>(null);

  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);

  const [writers, setWriters] = useState<Writer[]>([]);

  const [stats, setStats] = useState({
    posts: 0,
    readers: 0,
    writers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    try {
      // POSTS
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("views", {
          ascending: false,
        })
        .limit(20);

      const hero =
        postsData?.find(
          (post) => post.cover_image && post.cover_image.trim() !== "",
        ) || null;

      setHeroPost(hero);

      setFeaturedPosts(
        (postsData || []).filter((post) => post.id !== hero?.id),
      );

      // WRITERS
      const { data: writersData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .limit(3);

      // TOTAL POSTS
      const { count: postsCount } = await supabase.from("posts").select("*", {
        count: "exact",
        head: true,
      });

      // TOTAL WRITERS
      const { count: writersCount } = await supabase
        .from("profiles")
        .select("*", {
          count: "exact",
          head: true,
        });

      setWriters(writersData || []);

      setStats({
        posts: postsCount || 0,
        readers: (postsCount || 0) * 8,
        writers: writersCount || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const trendingTopics = [
    "Technology",
    "Writing",
    "Design",
    "Startups",
    "Productivity",
    "AI",
  ];

  if (loading) {
    return (
      <MainLayout>
        <div
          className="
            flex min-h-screen
            items-center justify-center
            px-4 text-center
          "
        >
          Loading homepage...
        </div>
      </MainLayout>
    );
  }

  // LOGGED-IN EXPERIENCE
  if (user) {
    return (
      <MainLayout>
        <section
          className="
            mx-auto
            w-full
            max-w-7xl
            overflow-x-hidden
            px-4 py-24
            sm:px-6
          "
        >
          {heroPost && (
            <motion.section
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
              }}
              className="
  relative
  overflow-hidden
  rounded-[40px]
  h-[90vh]
  flex
  items-center
  justify-center
"
            >
              {heroPost?.cover_image ? (
                <img
                  src={heroPost.cover_image}
                  alt={heroPost.title}
                  className="
      absolute
      inset-0
      h-full
      w-full
      object-cover
    "
                />
              ) : (
                <div
                  className="
      absolute
      inset-0
      bg-gradient-to-br
      from-indigo-600
      via-violet-600
      to-purple-700
    "
                />
              )}

              <div
                className="
        absolute
        inset-0
bg-gradient-to-t
from-black/90
via-black/60
to-black/20      "
              />

              <div
                className="
  relative
  z-10
  mx-auto
  max-w-5xl
  px-8
  text-center
  text-white
"
              >
                <p
                  className="
          text-sm
          uppercase
          tracking-[0.3em]
          text-white/70
        "
                >
                  Most Read Today
                </p>

                <div
                  className="
    mt-6
    flex
    flex-wrap
    justify-center
    gap-3
    text-sm
    text-white/80
  "
                >
                  <span>By {heroPost.author_username}</span>

                  <span>•</span>

                  <span>{calculateReadingTime(heroPost.content)} min read</span>

                  <span>•</span>

                  <span>{heroPost.views || 0} views</span>

                  <span>•</span>

                  <span>{heroPost.likes_count || 0} likes</span>
                </div>

                <h1
                  className="
          mt-6
         text-6xl
font-light
leading-[0.9]
md:text-8xl
lg:text-[7rem]        "
                >
                  {heroPost.title}
                </h1>

                <p
                  className="
          mt-8
          mx-auto
max-w-3xl
          text-lg
          text-white/90
          md:text-xl
        "
                >
                  {stripMarkdown(heroPost.content).slice(0, 180)}
                  ...
                </p>

                <div
                  className="
          mt-12
flex
justify-center
gap-5
flex-wrap
        "
                >
                  <Link to={`/post/${heroPost.id}`}>
                    <Button>Read Story</Button>
                  </Link>

                  <Link to="/write">
                    <Button variant="secondary">Start Writing</Button>
                  </Link>
                </div>
              </div>
            </motion.section>
          )}

          {/* QUICK STATS */}
          <section className="mt-24">
            <div
              className="
                grid grid-cols-1
                gap-6 md:grid-cols-3
              "
            >
              <Card>
                <h3
                  className="
                    text-6xl font-light md:text-7xl
                  "
                >
                  {stats.posts}
                </h3>

                <p className="mt-4 text-zinc-500">Published posts</p>
              </Card>

              <Card>
                <h3
                  className="
                    text-6xl font-light md:text-7xl
                  "
                >
                  {stats.readers}
                </h3>

                <p className="mt-4 text-zinc-500">Total readers</p>
              </Card>

              <Card>
                <h3
                  className="
                    text-6xl font-light md:text-7xl
                  "
                >
                  {stats.writers}
                </h3>

                <p className="mt-4 text-zinc-500">Writers</p>
              </Card>
            </div>
          </section>

          {/* TRENDING */}
          <section className="mt-24">
            <div
              className="
                mb-10 flex
                flex-col gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <h2
                className="
                  text-3xl font-light
                  tracking-tight
                  md:text-4xl
                "
              >
                Trending Articles
              </h2>

              <Link to="/explore">
                <button
                  className="
                    text-sm text-zinc-500
                    transition hover:text-black
                    dark:hover:text-white
                  "
                >
                  Explore all
                </button>
              </Link>
            </div>

            <div
              className="
                grid grid-cols-1
                gap-6 md:grid-cols-3
              "
            >
              {featuredPosts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="group">
                  <Card>
                    {post.cover_image && (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="
  mb-5 h-52 w-full
  rounded-2xl
  object-cover
  transition
  duration-500
  group-hover:scale-105
"
                      />
                    )}
                    <p
                      className="
                          text-sm text-zinc-500
                        "
                    >
                      {post.category || "Writing"}
                    </p>

                    <h3
                      className="
                          mt-4 text-2xl
                          font-light
                          leading-tight
                        "
                    >
                      {post.title}
                    </h3>

                    <div
                      className="
    mt-3
    flex
    flex-wrap
    gap-2
    text-xs
    text-zinc-500
  "
                    >
                      <span>By {post.author_username}</span>

                      <span>•</span>

                      <span>{calculateReadingTime(post.content)} min read</span>

                      <span>•</span>

                      <span>{post.views || 0} views</span>
                    </div>

                    <p
                      className="
    mt-6 line-clamp-3
    text-sm
    text-zinc-500
  "
                    >
                      {stripMarkdown(post.content)}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* TOPICS */}
          <section className="mt-24">
            <h2
              className="
                mb-10 text-3xl
                font-light tracking-tight
                md:text-4xl
              "
            >
              Trending Topics
            </h2>

            <div className="flex flex-wrap gap-4">
              {trendingTopics.map((topic) => (
                <Link
                  key={topic}
                  to={`/explore?tag=${encodeURIComponent(topic)}`}
                >
                  <Button variant="secondary">{topic}</Button>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </MainLayout>
    );
  }

  // PUBLIC LANDING PAGE
  return (
    <MainLayout>
      {/* HERO */}
      <motion.section
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative flex
          min-h-screen
          items-center justify-center
          overflow-hidden
          px-4 sm:px-6
        "
      >
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-zinc-100
            via-white
            to-white
            dark:from-zinc-950
            dark:via-black
            dark:to-black
          "
        />

        <div
          className="
            absolute left-1/2 top-1/2
            h-[500px] w-[500px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-indigo-500/20
            blur-3xl
            dark:bg-violet-500/20
          "
        />

        <div
          className="
            relative z-10
            mx-auto flex
            max-w-7xl
            flex-col items-center
            text-center
          "
        >
          <p
            className="
              mb-6 text-sm uppercase
              tracking-[0.3em]
              text-zinc-500
            "
          >
            Modern Publishing Platform
          </p>

          <h1
            className="
              max-w-5xl
              text-6xl
              font-light
              leading-[0.95]
              tracking-tight
              md:text-8xl
              lg:text-[8rem]
            "
          >
            Thoughtful writing, beautifully published.
          </h1>

          <p
            className="
              mt-10 mx-auto
max-w-3xl
              text-base leading-relaxed
              text-zinc-600
              dark:text-zinc-400
              md:text-lg
            "
          >
            Chatter is a modern platform for writers and readers who value
            depth, clarity, and meaningful storytelling.
          </p>

          <div
            className="
              mt-12 flex
              flex-wrap items-center
              justify-center gap-4
            "
          >
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>

            <Link to="/explore">
              <Button variant="secondary">Explore Articles</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4 py-12
          sm:px-6
        "
      >
        <div
          className="
            grid grid-cols-1
            gap-6 md:grid-cols-3
          "
        >
          <Card>
            <h3
              className="
                text-6xl font-light md:text-7xl
              "
            >
              {stats.posts}
            </h3>

            <p className="mt-4 text-zinc-500">Articles published</p>
          </Card>

          <Card>
            <h3
              className="
                text-4xl font-light
                md:text-5xl
              "
            >
              {stats.readers}
            </h3>

            <p className="mt-4 text-zinc-500">Active readers</p>
          </Card>

          <Card>
            <h3
              className="
                text-4xl font-light
                md:text-5xl
              "
            >
              {stats.writers}
            </h3>

            <p className="mt-4 text-zinc-500">Independent writers</p>
          </Card>
        </div>
      </section>

      {/* FEATURED WRITERS */}
      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4 py-24
          sm:px-6
        "
      >
        <h2
          className="
            mb-12 text-3xl
            font-light tracking-tight
            md:text-4xl
          "
        >
          Featured Writers
        </h2>

        <div
          className="
            grid grid-cols-1
            gap-6 md:grid-cols-3
          "
        >
          {writers.map((writer) => (
            <Card key={writer.username}>
              <div className="flex items-center gap-4">
                {writer.avatar_url ? (
                  <img
                    src={writer.avatar_url}
                    alt="writer"
                    className="
                      h-14 w-14
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-14 w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-zinc-200
                      dark:bg-zinc-700
                    "
                  >
                    {writer.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium">{writer.username}</h3>

                  <p
                    className="
                      text-sm text-zinc-500
                    "
                  >
                    Writer
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
