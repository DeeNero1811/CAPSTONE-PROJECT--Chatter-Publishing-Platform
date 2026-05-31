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
  status: string;
};

function stripMarkdown(text: string) {
  return text
    .replace(/[#_*>\-\[\]]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

export default function Drafts() {
  const { user } = useAuth();

  const [drafts, setDrafts] = useState<Post[]>([]);

  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  async function fetchPosts() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .in("status", ["draft", "archived"])
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);

        return;
      }

      const draftPosts = data?.filter((post) => post.status === "draft") || [];

      const archived = data?.filter((post) => post.status === "archived") || [];

      setDrafts(draftPosts);

      setArchivedPosts(archived);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function archivePost(postId: string) {
    await supabase
      .from("posts")
      .update({
        status: "archived",
      })
      .eq("id", postId);

    fetchPosts();
  }

  async function restorePost(postId: string) {
    await supabase
      .from("posts")
      .update({
        status: "draft",
      })
      .eq("id", postId);

    fetchPosts();
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading drafts...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="mb-12 text-5xl font-light tracking-tight">
          Content Studio
        </h1>

        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-light">Drafts</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {drafts.map((draft) => (
              <div key={draft.id}>
                <Link to={`/write/${draft.id}`}>
                  <Card>
                    <p className="text-sm text-zinc-500">Draft</p>

                    <h2 className="mt-4 text-3xl font-light leading-tight">
                      {draft.title || "Untitled Draft"}
                    </h2>

                    <p className="mt-6 line-clamp-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {stripMarkdown(draft.content)}
                    </p>

                    <p className="mt-8 text-sm text-zinc-500">
                      {new Date(draft.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                </Link>

                <button
                  onClick={() => archivePost(draft.id)}
                  className="
                      mt-3 rounded-full
                      border border-zinc-300
                      px-4 py-2 text-sm
                      transition hover:bg-zinc-100
                      dark:border-zinc-700
                      dark:hover:bg-zinc-800
                    "
                >
                  Archive
                </button>
              </div>
            ))}
          </div>

          {!drafts.length && (
            <div className="py-10 text-zinc-500">No drafts yet.</div>
          )}
        </div>

        <div>
          <h2 className="mb-8 text-3xl font-light">Archived Posts</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {archivedPosts.map((post) => (
              <Card key={post.id}>
                <p className="text-sm text-zinc-500">Archived</p>

                <h2 className="mt-4 text-3xl font-light leading-tight">
                  {post.title}
                </h2>

                <p className="mt-6 line-clamp-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {stripMarkdown(post.content)}
                </p>

                <button
                  onClick={() => restorePost(post.id)}
                  className="
                      mt-8 rounded-full
                      bg-black px-5 py-3
                      text-sm text-white
                      transition
                      hover:scale-[1.02]
                      dark:bg-white
                      dark:text-black
                    "
                >
                  Restore Draft
                </button>
              </Card>
            ))}
          </div>

          {!archivedPosts.length && (
            <div className="py-10 text-zinc-500">No archived posts.</div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
