import { useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Card from "../components/ui/Card";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;

  cover_image?: string;

  tags?: string[];
  views?: number;

  likes_count?: number;

  comments_count?: number;

  author_username?: string;

  author_avatar?: string;
};

type Creator = {
  id: string;
  username: string;

  avatar_url?: string;

  tagline?: string;

  followers?: number;
};

function calculateReadingTime(text: string) {
  const words = text.split(" ").length;

  const minutes = Math.ceil(words / 200);

  return `${minutes} min read`;
}

function stripMarkdown(text: string) {
  return text
    .replace(/[#_*>\-\[\]]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

export default function Explore() {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  const [creators, setCreators] = useState<Creator[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    const tag = searchParams.get("tag");

    if (tag) {
      setActiveTag(tag);
    }
  }, [searchParams]);

  const [page, setPage] = useState(0);

  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    setPosts([]);

    setPage(0);

    setHasMore(true);

    fetchPosts(0, true);

    fetchTrendingPosts();

    fetchCreators();
  }, [search, activeTag]);

  async function enrichPosts(postsData: any[]) {
    const authorIds = postsData.map((post) => post.author_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", authorIds);

    return postsData.map((post) => {
      const profile = profiles?.find((p) => p.id === post.author_id);

      return {
        ...post,

        author_username: profile?.username,

        author_avatar: profile?.avatar_url,
      };
    });
  }

  async function fetchCreators() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(6);

    if (error) {
      console.error(error);

      return;
    }

    const creatorsWithFollowers = await Promise.all(
      (data || []).map(async (creator) => {
        const { data: followers } = await supabase
          .from("followers")
          .select("*")
          .eq("following_id", creator.id);

        return {
          ...creator,

          followers: followers?.length || 0,
        };
      }),
    );

    setCreators(creatorsWithFollowers);
  }

  async function followCreator(creatorId: string) {
    if (!user) return;

    await supabase.from("followers").insert({
      follower_id: user.id,

      following_id: creatorId,
    });

    fetchCreators();
  }

  async function fetchPosts(currentPage = page, reset = false) {
    try {
      const from = currentPage * POSTS_PER_PAGE;

      const to = from + POSTS_PER_PAGE - 1;

      let data = null;

      let error = null;

      // USE pg_trgm SEARCH
      if (search.trim()) {
        const response = await supabase.rpc("search_posts", {
          search_query: search,
        });

        data = response.data;

        error = response.error;
      } else {
        const response = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .order("created_at", {
            ascending: false,
          })
          .range(from, to);

        data = response.data;

        error = response.error;
      }

      if (error) {
        console.error(error);

        return;
      }

      let filteredPosts = data || [];

      // FILTER TAGS
      if (activeTag) {
filteredPosts = filteredPosts.filter((post: Post) =>          post.tags?.includes(activeTag),
        );
      }

      // PAGINATION
      filteredPosts = filteredPosts.slice(from, to + 1);

      const enriched = await enrichPosts(filteredPosts);

      if (reset) {
        setPosts(enriched);
      } else {
        setPosts((prev) => [...prev, ...enriched]);
      }

      if (filteredPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrendingPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("likes_count", {
        ascending: false,
      })
      .order("comments_count", {
        ascending: false,
      })
      .order("views", {
        ascending: false,
      })
      .limit(6);

    if (error) {
      console.error(error);

      return;
    }

    const enriched = await enrichPosts(data || []);

    setTrendingPosts(enriched);
  }

  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;

        setPage(nextPage);

        fetchPosts(nextPage);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, hasMore, loading]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading posts...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="mb-12 text-5xl font-light tracking-tight">
          Explore Articles
        </h1>

        {activeTag && (
          <div
            className="
      mb-6
      inline-block
      rounded-full
      bg-indigo-100
      px-4 py-2
      text-sm
      text-indigo-700
    "
          >
            Viewing: #{activeTag}
            <button onClick={() => setActiveTag("")}>✕</button>
          </div>
        )}

        <div className="mb-10">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full rounded-3xl border
              border-zinc-300 bg-white
              px-6 py-4 outline-none
              transition
              dark:border-zinc-700
              dark:bg-zinc-900
              dark:text-white
            "
          />
        </div>

        <div className="mb-20">
          <h2 className="mb-6 text-3xl font-light tracking-tight">
            Recommended Creators
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {creators.map((creator) => (
              <Card key={creator.id}>
                <Link
                  to={`/profile/${creator.username}`}
                  className="
                      flex items-center gap-4
                    "
                >
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt="avatar"
                      className="
                          h-16 w-16 rounded-full
                          object-cover
                        "
                    />
                  ) : (
                    <div
                      className="
                          flex h-16 w-16
                          items-center justify-center
                          rounded-full bg-zinc-200
                          text-lg font-medium
                          dark:bg-zinc-800
                        "
                    >
                      {creator.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium">@{creator.username}</h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {creator.tagline || "Creator"}
                    </p>

                    <p className="mt-2 text-xs text-zinc-400">
                      {creator.followers} followers
                    </p>
                  </div>
                </Link>

                {user && user.id !== creator.id && (
                  <button
                    onClick={() => followCreator(creator.id)}
                    className="
                          mt-6 rounded-full
                          bg-black px-5 py-2
                          text-sm text-white
                          transition
                          hover:scale-[1.02]
                          dark:bg-white
                          dark:text-black
                        "
                  >
                    Follow
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-3xl font-light tracking-tight">
            Trending Posts
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {trendingPosts.map((post) => (
              <Card key={post.id}>
                <Link to={`/post/${post.id}`}>
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="
          mb-4 h-48 w-full
          rounded-2xl
          object-cover
        "
                    />
                  )}

                  <p className="text-sm text-zinc-500">Trending</p>

                  <h3 className="mt-3 text-xl font-light leading-snug">
                    {post.title}
                  </h3>
                </Link>

                <Link
                  to={`/profile/${post.author_username}`}
                  className="
                      mt-6 flex items-center gap-3
                    "
                >
                  {post.author_avatar ? (
                    <img
                      src={post.author_avatar}
                      alt="avatar"
                      className="
                          h-10 w-10 rounded-full
                          object-cover
                        "
                    />
                  ) : (
                    <div
                      className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-full bg-zinc-200
                          text-sm font-medium
                          dark:bg-zinc-800
                        "
                    >
                      {post.author_username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p
                      className="
                          text-sm text-zinc-500
                          transition hover:text-black
                          dark:hover:text-white
                        "
                    >
                      @{post.author_username}
                    </p>
                  </div>
                </Link>

                <div className="mt-4 flex gap-4 text-sm text-zinc-500">
                  <span>{post.views || 0} views</span>

                  <span>{post.likes_count || 0} likes</span>

                  <span>{post.comments_count || 0} comments</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {loading && (
            <div className="col-span-2 py-10 text-center text-zinc-500">
              Loading more posts...
            </div>
          )}

          {posts.map((post) => (
            <Card key={post.id}>
              <Link to={`/post/${post.id}`}>
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="
  mb-5
  h-56 md:h-64
  w-full
  rounded-3xl
  object-cover
"
                  />
                )}

                <p className="text-sm text-zinc-500">Published Article</p>

                <h2 className="mt-4 text-3xl font-light leading-tight">
                  {post.title}
                </h2>

                <p className="mt-6 line-clamp-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {stripMarkdown(post.content)}
                </p>
              </Link>

              <Link
                to={`/profile/${post.author_username}`}
                className="
          mt-6 flex items-center gap-3
        "
              >
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt="avatar"
                    className="
              h-11 w-11 rounded-full
              object-cover
            "
                  />
                ) : (
                  <div
                    className="
              flex h-11 w-11
              items-center justify-center
              rounded-full bg-zinc-200
              text-sm font-medium
              dark:bg-zinc-800
            "
                  >
                    {post.author_username?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p
                    className="
              text-sm text-zinc-500
              transition hover:text-black
              dark:hover:text-white
            "
                  >
                    @{post.author_username}
                  </p>
                </div>
              </Link>

              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className="
                rounded-full bg-zinc-100
                px-3 py-1 text-xs
                text-zinc-600 transition
                hover:bg-zinc-200
                dark:bg-zinc-800
                dark:text-zinc-300
                dark:hover:bg-zinc-700
              "
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>

                <span>•</span>

                <span>{calculateReadingTime(post.content)}</span>

                <span>•</span>

                <span>{post.views || 0} views</span>
              </div>
            </Card>
          ))}
        </div>

        {!hasMore && posts.length > 0 && (
          <div className="py-16 text-center text-zinc-500">
            You’ve reached the end.
          </div>
        )}
      </section>
    </MainLayout>
  );
}
