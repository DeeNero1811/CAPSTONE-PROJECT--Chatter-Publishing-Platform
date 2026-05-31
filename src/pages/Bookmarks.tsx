import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Card from "../components/ui/Card";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type BookmarkPost = {
  post_id: string;

  posts: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  };
};

function stripMarkdown(text: string) {
  return text
    .replace(/[#_*>\-\[\]]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

export default function Bookmarks() {
  const { user } = useAuth();

  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  async function fetchBookmarks() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select(
          `
            post_id,
            posts (
              id,
              title,
              content,
              created_at
            )
          `,
        )
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

setBookmarks(data as unknown as BookmarkPost[]);    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading saved articles...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="mb-12 text-5xl font-light tracking-tight">
          Saved Articles
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {bookmarks.map((bookmark) => (
            <Link
              key={bookmark.post_id}
              to={`/post/${bookmark.post_id}`}
            >
              <Card>
                <p className="text-sm text-zinc-500">
                  Saved Article
                </p>

                <h2 className="mt-4 text-3xl font-light leading-tight">
                  {bookmark.posts.title}
                </h2>

                <p className="mt-6 line-clamp-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {stripMarkdown(bookmark.posts.content)}
                </p>

                <p className="mt-8 text-sm text-zinc-500">
                  {new Date(
                    bookmark.posts.created_at
                  ).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {!bookmarks.length && (
          <div className="py-24 text-center text-zinc-500">
            No saved articles yet.
          </div>
        )}
      </section>
    </MainLayout>
  );
}