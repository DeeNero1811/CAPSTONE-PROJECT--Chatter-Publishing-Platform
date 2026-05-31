import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import Card from "../components/ui/Card"

import { supabase } from "../lib/supabase"

import { useAuth } from "../context/AuthContext"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Post = {
  id: string
  title: string
  views?: number
  likes_count?: number
  comments_count?: number
  bookmarks_count?: number
  created_at: string
}

export default function Dashboard() {
  const { user } = useAuth()

  const [posts, setPosts] =
    useState<Post[]>([])

  const [followers, setFollowers] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  async function fetchAnalytics() {
    if (!user) return

    const { data: postsData } =
      await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)

    const { data: followersData } =
      await supabase
        .from("followers")
        .select("*")
        .eq("following_id", user.id)

    setPosts(postsData || [])

    setFollowers(
      followersData?.length || 0
    )

    setLoading(false)
  }

  const totalViews =
    posts.reduce(
      (acc, post) =>
        acc + (post.views || 0),
      0
    )

  const totalLikes =
    posts.reduce(
      (acc, post) =>
        acc +
        (post.likes_count || 0),
      0
    )

  const totalComments =
    posts.reduce(
      (acc, post) =>
        acc +
        (post.comments_count ||
          0),
      0
    )

  const totalBookmarks =
    posts.reduce(
      (acc, post) =>
        acc +
        (post.bookmarks_count ||
          0),
      0
    )

  const last7Days =
    posts.filter((post) => {
      const created =
        new Date(
          post.created_at
        )

      const now = new Date()

      const diff =
        now.getTime() -
        created.getTime()

      return (
        diff <
        7 *
          24 *
          60 *
          60 *
          1000
      )
    })

  const previous7Days =
    posts.filter((post) => {
      const created =
        new Date(
          post.created_at
        )

      const now = new Date()

      const diff =
        now.getTime() -
        created.getTime()

      return (
        diff >
          7 *
            24 *
            60 *
            60 *
            1000 &&
        diff <
          14 *
            24 *
            60 *
            60 *
            1000
      )
    })

  function calculateGrowth(
    current: number,
    previous: number
  ) {
    if (previous === 0)
      return 100

    return Math.round(
      ((current - previous) /
        previous) *
        100
    )
  }

  const currentViews =
    last7Days.reduce(
      (acc, post) =>
        acc + (post.views || 0),
      0
    )

  const previousViews =
    previous7Days.reduce(
      (acc, post) =>
        acc + (post.views || 0),
      0
    )

  const growth =
    calculateGrowth(
      currentViews,
      previousViews
    )

  const analyticsData = [
    {
      name: "Mon",
      views: 120,
    },
    {
      name: "Tue",
      views: 210,
    },
    {
      name: "Wed",
      views: 180,
    },
    {
      name: "Thu",
      views: 320,
    },
    {
      name: "Fri",
      views: 280,
    },
    {
      name: "Sat",
      views: 390,
    },
    {
      name: "Sun",
      views: 450,
    },
  ]

  const topPost = [...posts].sort(
    (a, b) =>
      (b.views || 0) -
      (a.views || 0)
  )[0]

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
          Loading dashboard...
        </div>
      </MainLayout>
    )
  }

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
        {/* HEADER */}
        <div className="mb-14">
          <p
            className="
              text-sm uppercase
              tracking-[0.2em]
              text-zinc-500
            "
          >
            Creator Analytics
          </p>

          <h1
            className="
              mt-4 text-5xl
              font-light tracking-tight
              md:text-7xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-6 max-w-2xl
              text-base leading-relaxed
              text-zinc-600
              dark:text-zinc-400
              md:text-lg
            "
          >
            Compare your creator
            growth, audience
            engagement, and content
            performance over time.
          </p>
        </div>

        {/* STATS */}
        <div
          className="
            grid grid-cols-1
            gap-6
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <Card>
            <p className="text-sm text-zinc-500">
              Total Views
            </p>

            <h2
              className="
                mt-4 text-4xl
                font-light
                md:text-5xl
              "
            >
              {totalViews}
            </h2>

            <p
              className="
                mt-4 text-sm
                text-green-500
              "
            >
              +{growth}% vs
              previous week
            </p>
          </Card>

          <Card>
            <p className="text-sm text-zinc-500">
              Total Likes
            </p>

            <h2
              className="
                mt-4 text-4xl
                font-light
                md:text-5xl
              "
            >
              {totalLikes}
            </h2>
          </Card>

          <Card>
            <p className="text-sm text-zinc-500">
              Total Comments
            </p>

            <h2
              className="
                mt-4 text-4xl
                font-light
                md:text-5xl
              "
            >
              {totalComments}
            </h2>
          </Card>

          <Card>
            <p className="text-sm text-zinc-500">
              Followers
            </p>

            <h2
              className="
                mt-4 text-4xl
                font-light
                md:text-5xl
              "
            >
              {followers}
            </h2>
          </Card>
        </div>

        {/* SECONDARY STATS */}
        <div
          className="
            mt-14 grid
            grid-cols-1
            gap-6
            md:grid-cols-2
          "
        >
          <Card>
            <p className="text-sm text-zinc-500">
              Weekly Performance
            </p>

            <h2
              className="
                mt-4 text-3xl
                font-light
                md:text-4xl
              "
            >
              {currentViews} views
            </h2>

            <p className="mt-4 text-zinc-500">
              Previous 7 days:
              {" "}
              {previousViews}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-zinc-500">
              Bookmarks
            </p>

            <h2
              className="
                mt-4 text-3xl
                font-light
                md:text-4xl
              "
            >
              {totalBookmarks}
            </h2>

            <p className="mt-4 text-zinc-500">
              Readers saving your
              work
            </p>
          </Card>
        </div>

     {/* CHART */}
<div className="mt-14">
  <h2
    className="
      mb-6 text-3xl
      font-light
    "
  >
    Audience Growth
  </h2>

  <Card>
    <div
      className="
        h-[300px]
        w-full
        sm:h-[400px]
      "
    >
      <LineChart
        width={800}
        height={350}
        data={analyticsData}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          strokeOpacity={0.1}
        />

        <XAxis
          dataKey="name"
        />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="views"
          stroke="#6366f1"
          strokeWidth={3}
        />
      </LineChart>
    </div>
  </Card>
</div>

        {/* TOP POST */}
        <div className="mt-14">
          <h2
            className="
              mb-6 text-3xl
              font-light
            "
          >
            Top Performing Post
          </h2>

          {topPost ? (
            <Card>
              <h3
                className="
                  text-2xl
                  font-light
                  md:text-3xl
                "
              >
                {topPost.title}
              </h3>

              <div
                className="
                  mt-6 flex
                  flex-wrap gap-4
                  text-sm
                  text-zinc-500
                "
              >
                <span>
                  {topPost.views ||
                    0}
                  {" "}
                  views
                </span>

                <span>
                  {topPost.likes_count ||
                    0}
                  {" "}
                  likes
                </span>

                <span>
                  {topPost.comments_count ||
                    0}
                  {" "}
                  comments
                </span>
              </div>
            </Card>
          ) : (
            <p className="text-zinc-500">
              No posts yet.
            </p>
          )}
        </div>
      </section>
    </MainLayout>
  )
}