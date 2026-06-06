import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import MDEditor from "@uiw/react-md-editor";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

import { Heart, MessageCircle, Bookmark } from "lucide-react";

import { useAuth } from "../context/AuthContext";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
  views?: number;
  cover_image?: string;

  likes_count?: number;

  comments_count?: number;

  author_id: string;

  author_username?: string;

  author_avatar?: string;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;

  parent_id?: string | null;

  username?: string;

  avatar_url?: string;
};

function calculateReadingTime(text: string) {
  const words = text.split(" ").length;

  const minutes = Math.ceil(words / 200);

  return `${minutes} min read`;
}

export default function Post() {
  const { user } = useAuth();

  const [likes, setLikes] = useState(0);

  const [liked, setLiked] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);

  const [comment, setComment] = useState("");

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [replyContent, setReplyContent] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);

  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);

  const { id } = useParams();

  const [post, setPost] = useState<Post | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }

    const channel = supabase
      .channel(`comments-${id}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchComments();
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);

        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", data.author_id)
        .single();

      setPost({
        ...data,

        author_username: profile?.username,

        author_avatar: profile?.avatar_url,
      });

      incrementViews(data.views || 0);

      fetchLikes();

      fetchComments();

      fetchRecommendedPosts(data);

      fetchBookmark();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecommendedPosts(currentPost: Post) {
    if (!currentPost.tags?.length) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .neq("id", currentPost.id)
      .eq("status", "published")
      .overlaps("tags", currentPost.tags)
      .limit(4);

    if (error) {
      console.error(error);
      return;
    }

    const authorIds = data?.map((post) => post.author_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", authorIds);

    const enriched = (data || []).map((post) => {
      const profile = profiles?.find((p) => p.id === post.author_id);

      return {
        ...post,
        author_username: profile?.username,
        author_avatar: profile?.avatar_url,
      };
    });

    setRecommendedPosts(enriched);
  }

  async function incrementViews(currentViews: number) {
    if (!id) return;

    const viewedPosts = JSON.parse(
      localStorage.getItem("viewed_posts") || "[]",
    );

    if (viewedPosts.includes(id)) {
      return;
    }

    await supabase
      .from("posts")
      .update({
        views: currentViews + 1,
      })
      .eq("id", id);

    localStorage.setItem("viewed_posts", JSON.stringify([...viewedPosts, id]));
  }

  async function toggleLike() {
    if (!user || !id || !post) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", user.id);

      const newLikes = Math.max(likes - 1, 0);

      setLiked(false);

      setLikes(newLikes);

      await supabase
        .from("posts")
        .update({
          likes_count: newLikes,
        })
        .eq("id", id);
    } else {
      await supabase.from("likes").insert({
        post_id: id,
        user_id: user.id,
      });

      const newLikes = likes + 1;

      setLiked(true);

      setLikes(newLikes);

      await supabase
        .from("posts")
        .update({
          likes_count: newLikes,
        })
        .eq("id", id);

      if (post.author_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: post.author_id,

          type: "like",

          message: `${user.email?.split("@")[0]} liked your article.`,

          sender_username: user.email?.split("@")[0].toLowerCase(),
        });
      }
    }
  }

  async function toggleBookmark() {
    if (!user || !id) return;

    if (bookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("post_id", id)
        .eq("user_id", user.id);

      setBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({
        post_id: id,
        user_id: user.id,
      });

      setBookmarked(true);
    }
  }

  async function handleComment(parentId?: string) {
    if (!user || !id) return;

    const content = parentId ? replyContent : comment;

const { error } = await supabase      .from("comments")
      .insert({
        content,
        post_id: id,
        user_id: user.id,
        parent_id: parentId || null,
      })
      .select();

    if (error) {
      console.log(error);
      alert(JSON.stringify(error, null, 2));
      return;
    }

    if (post?.author_id && post.author_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.author_id,
        type: "comment",
        message: `${user.email?.split("@")[0]} commented on your article.`,
        sender_username: user.email?.split("@")[0].toLowerCase(),
      });
    }

    setComment("");
    setReplyContent("");
    setReplyingTo(null);

    await supabase
      .from("posts")
      .update({
        comments_count: (post?.comments_count || 0) + 1,
      })
      .eq("id", id);

    fetchComments();
  }

  async function fetchLikes() {
    if (!id) return;

    const { data } = await supabase.from("likes").select("*").eq("post_id", id);

    setLikes(data?.length || 0);

    if (user) {
      const existingLike = data?.find((like) => like.user_id === user.id);

      setLiked(!!existingLike);
    }
  }

  async function fetchBookmark() {
    if (!user || !id) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setBookmarked(!!data);
  }

  async function fetchComments() {
    if (!id) return;

    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (!data) return;

    const userIds = data.map((comment) => comment.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    const enrichedComments = data.map((comment) => {
      const profile = profiles?.find((p) => p.id === comment.user_id);

      return {
        ...comment,

        username: profile?.username,

        avatar_url: profile?.avatar_url,
      };
    });

    setComments(enrichedComments || []);

  }

  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading article...
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Post not found.
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <Helmet>
        <title>{post.title} | Chatter</title>

        <meta
          name="description"
          content={post.content.slice(0, 160).replace(/[#_*>\-\[\]]/g, "")}
        />
      </Helmet>
      <article className="mx-auto max-w-4xl px-6 py-24">
        <div className="mb-16 border-b border-zinc-200 pb-12 dark:border-zinc-800">
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="
      mb-10 h-[420px] w-full
      rounded-3xl
      object-cover
    "
            />
          )}
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Published Article
          </p>

          <h1 className="mt-6 text-4xl font-light leading-tight tracking-tight md:text-6xl">
            {" "}
            {post.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>

            <span>•</span>

            <span>{calculateReadingTime(post.content)}</span>

            <span>•</span>

            <span>{post.views || 0} views</span>
          </div>

          <Link
            to={`/profile/${post.author_username || ""}`}
            className="
              mt-6 flex items-center gap-3
            "
          >
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt="avatar"
                className="
                  h-12 w-12 rounded-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex h-12 w-12
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
                By @{post.author_username || "unknown"}
              </p>
            </div>
          </Link>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="
                    rounded-full bg-zinc-100
                    px-3 py-1 text-xs
                    text-zinc-600
                    dark:bg-zinc-800
                    dark:text-zinc-300
                  "
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ENGAGEMENT BAR */}

        <div
          className="
    fixed bottom-4 left-1/2
    z-40 flex
    -translate-x-1/2
    items-center gap-1
    rounded-full border
    border-zinc-200
    bg-white/90 px-3 py-1.5
    shadow-xl backdrop-blur-xl
    dark:border-zinc-800
    dark:bg-zinc-900/90

    md:left-[max(24px,calc(50%-520px))]
    md:top-1/2
    md:w-[56px]
    md:-translate-y-1/2
    md:translate-x-0
    md:flex-col
  "
        >
          {/* LIKE */}
          <button
            onClick={toggleLike}
            className="
      flex h-10 items-center
      justify-center gap-2
      rounded-full px-3
      text-sm transition
      hover:scale-105
      hover:bg-zinc-100
      dark:hover:bg-zinc-800

      md:w-11
      md:px-0
    "
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />

            <span className="md:hidden">{likes}</span>
          </button>

          {/* BOOKMARK */}
          <button
            onClick={toggleBookmark}
            className="
      flex h-10 items-center
      justify-center gap-2
      rounded-full px-3
      text-sm transition
      hover:scale-105
      hover:bg-zinc-100
      dark:hover:bg-zinc-800

      md:w-11
      md:px-0
    "
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />

            <span className="md:hidden">Save</span>
          </button>

          {/* COMMENTS */}
          <div
            className="
    flex h-10 items-center
    justify-center gap-2
    rounded-full px-3
    text-sm text-zinc-500
    transition
    hover:scale-105
    hover:bg-zinc-100
    dark:hover:bg-zinc-800

    md:w-11
    md:px-0
  "
          >
            <MessageCircle size={18} />

            <span className="md:hidden">{comments.length}</span>
          </div>

          {/* VIEWS */}
          <div
            className="
    flex h-10 items-center
    justify-center gap-2
    rounded-full px-3
    text-sm text-zinc-500
    transition
    hover:scale-105
    hover:bg-zinc-100
    dark:hover:bg-zinc-800

    md:w-11
    md:px-0
  "
          >
            <span className="text-base">👁</span>

            <span className="md:hidden">{post.views || 0}</span>
          </div>
        </div>
        <div
  className="
    prose prose-lg prose-zinc
    max-w-none leading-relaxed
    prose-img:my-10
    prose-img:rounded-2xl
    prose-img:w-full
    dark:prose-invert
  "
  data-color-mode="light"
>
  <MDEditor.Markdown source={post.content} />
</div>

        <section className="mt-24 border-t border-zinc-200 pt-14 dark:border-zinc-800">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Personalized Discovery
            </p>

            <h2 className="mt-4 text-3xl font-light tracking-tight md:text-4xl">
              Recommended For You
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Articles related to this topic based on tags, creator interests,
              and engagement.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {recommendedPosts.map((recommended) => (
              <Link
                key={recommended.id}
                to={`/post/${recommended.id}`}
                className="
            rounded-3xl border
            border-zinc-200 p-6
            transition hover:scale-[1.01]
            dark:border-zinc-800
          "
              >
                <p className="text-sm text-zinc-500">Recommended Article</p>

                <h3 className="mt-4 text-2xl font-light leading-snug">
                  {recommended.title}
                </h3>

                <div className="mt-6 flex items-center gap-3">
                  {recommended.author_avatar ? (
                    <img
                      src={recommended.author_avatar}
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
                      {recommended.author_username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-zinc-500">
                      @{recommended.author_username}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {recommended.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="
                    rounded-full bg-zinc-100
                    px-3 py-1 text-xs
                    text-zinc-600
                    dark:bg-zinc-800
                    dark:text-zinc-300
                  "
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
                  <span>{recommended.views || 0} views</span>

                  <span>•</span>

                  <span>{recommended.likes_count} likes</span>

                  <span>•</span>

                  <span>{recommended.comments_count} comments</span>
                </div>
              </Link>
            ))}
          </div>

          {!recommendedPosts.length && (
            <div className="py-10 text-zinc-500">
              No related articles found yet.
            </div>
          )}
        </section>

        <section className="mt-20 border-t border-zinc-200 pt-12 dark:border-zinc-800">
          <h2 className="text-3xl font-light tracking-tight">Discussion</h2>

          <div className="mt-8 flex flex-col gap-4">
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}
              placeholder="Share your thoughts..."
              rows={4}
              className="
                w-full rounded-3xl border
                border-zinc-300 bg-white
                px-5 py-4 outline-none
                dark:border-zinc-700
                dark:bg-zinc-900
              "
            />

            <div>
              <button
                onClick={() => handleComment()}
                className="
                  rounded-full bg-black
                  px-6 py-3 text-sm text-white
                  transition hover:scale-[1.02]
                  dark:bg-white dark:text-black
                "
              >
                Post Comment
              </button>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            {comments
              .filter((comment) => !comment.parent_id)
              .map((comment) => (
                <div
                  key={comment.id}
                  className="
                    rounded-3xl border
                    border-zinc-200 p-6
                    dark:border-zinc-800
                  "
                >
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${comment.username}`}>
                      {comment.avatar_url ? (
                        <img
                          src={comment.avatar_url}
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
                          {comment.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div>
                      <Link
                        to={`/profile/${comment.username}`}
                        className="
                          text-sm font-medium
                          text-zinc-700
                          transition hover:text-black
                          dark:text-zinc-300
                          dark:hover:text-white
                        "
                      >
                        @{comment.username}
                      </Link>

                      <p className="text-xs text-zinc-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      mt-5 leading-relaxed
                      text-zinc-700
                      dark:text-zinc-300
                    "
                  >
                    {comment.content}
                  </p>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="
      flex items-center gap-2
      text-sm text-zinc-500
      transition hover:text-black
      dark:hover:text-white
    "
                    >
                      <MessageCircle size={16} />
                      Reply
                    </button>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="mt-6">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="
        w-full rounded-2xl border
        border-zinc-300 bg-white
        px-4 py-3 outline-none
        dark:border-zinc-700
        dark:bg-zinc-900
      "
                      />

                      <button
                        onClick={() => handleComment(comment.id)}
                        className="
        mt-4 rounded-full
        bg-black px-5 py-2
        text-sm text-white
        dark:bg-white
        dark:text-black
      "
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  <div className="mt-6 ml-8 space-y-4">
                    {comments
                      .filter((reply) => reply.parent_id === comment.id)
                      .map((reply) => (
                        <div
                          key={reply.id}
                          className="
      rounded-2xl border
      border-zinc-200 p-4
      dark:border-zinc-800
    "
                        >
                          <div className="flex items-start gap-3">
                            <Link to={`/profile/${reply.username}`}>
                              {reply.avatar_url ? (
                                <img
                                  src={reply.avatar_url}
                                  alt="avatar"
                                  className="
              h-9 w-9 rounded-full
              object-cover
            "
                                />
                              ) : (
                                <div
                                  className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-zinc-200
              text-xs font-medium
              dark:bg-zinc-800
            "
                                >
                                  {reply.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </Link>

                            <div className="flex-1">
                              <Link
                                to={`/profile/${reply.username}`}
                                className="
            text-sm font-medium
            text-zinc-700
            transition hover:text-black
            dark:text-zinc-300
            dark:hover:text-white
          "
                              >
                                @{reply.username}
                              </Link>

                              <p
                                className="
            mt-3 text-sm
            leading-relaxed
            text-zinc-600
            dark:text-zinc-400
          "
                              >
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </article>
    </MainLayout>
  );
}
