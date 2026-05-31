import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Card from "../components/ui/Card";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar?: string;
};

function stripMarkdown(text: string) {
  return text
    .replace(/[#_*>\-\[\]]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

export default function Following() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowingPosts();
    }
  }, [user]);

  async function fetchFollowingPosts() {
    if (!user) return;

    try {
      const { data: followingData } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = followingData?.map((f) => f.following_id) || [];

      if (!followingIds.length) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .in("author_id", followingIds)
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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
          Loading following feed...
        </div>
      </MainLayout>
    );
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
            Personalized Feed
          </p>

          <h1
            className="
              mt-4
              text-5xl font-light
              tracking-tight
              md:text-7xl
            "
          >
            Following
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
            Latest articles from creators you follow.
          </p>
        </div>

        {/* POSTS */}
        {posts.length > 0 ? (
          <div
            className="
              grid grid-cols-1
              gap-6 md:grid-cols-2
            "
          >
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="w-full">
                <Card>
                  <div
                    className="
                      min-w-0
                      w-full
                    "
                  >
                    {/* AUTHOR */}
                    <div
                      className="
                        mb-6 flex
                        min-w-0
                        items-center gap-4
                      "
                    >
                      {post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt="author"
                          className="
                            h-14 w-14
                            flex-shrink-0
                            rounded-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-14 w-14
                            flex-shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-zinc-200
                            text-lg font-medium
                            dark:bg-zinc-800
                          "
                        >
                          {post.author_username?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <h3
                          className="
                            truncate
                            text-xl
                            font-medium
                          "
                        >
                          @{post.author_username}
                        </h3>

                        <p
                          className="
                            text-sm
                            text-zinc-500
                          "
                        >
                          Creator
                        </p>
                      </div>
                    </div>

                    {/* POST */}
                    <h2
                      className="
                        line-clamp-2
                        text-3xl
                        font-light
                        leading-tight
                        md:text-4xl
                      "
                    >
                      {post.title}
                    </h2>

                    <p
                      className="
                        mt-6 line-clamp-3
                        text-sm leading-relaxed
                        text-zinc-600
                        dark:text-zinc-400
                        md:text-base
                      "
                    >
                      {stripMarkdown(post.content)}
                    </p>

                    <p
                      className="
                        mt-8 text-sm
                        text-zinc-500
                      "
                    >
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="
              flex min-h-[300px]
              items-center justify-center
              rounded-3xl border
              border-zinc-200
              bg-white px-6
              text-center
              text-zinc-500
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            No posts from followed creators yet.
          </div>
        )}
      </section>
    </MainLayout>
  );
}
