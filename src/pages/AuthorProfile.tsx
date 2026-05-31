import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Card from "../components/ui/Card";

import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url?: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function AuthorProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error(error);

        return;
      }

      setProfile(data);

      fetchPosts(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts(authorId: string) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", authorId)
      .eq("status", "published")
      .order("created_at", {
        ascending: false,
      });

    setPosts(data || []);
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading profile...
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Profile not found.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-16">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="
      mb-6 h-24 w-24
      rounded-full
      object-cover
      ring-4 ring-zinc-100
      dark:ring-zinc-800
    "
            />
          ) : (
            <div
              className="
      mb-6 flex h-24 w-24
      items-center justify-center
      rounded-full
      bg-zinc-200
      text-3xl font-light
      dark:bg-zinc-800
    "
            >
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-5xl font-light tracking-tight">
            {profile.full_name}
          </h1>

          <p className="mt-3 text-lg text-zinc-500">@{profile.username}</p>

          <p className="mt-6 max-w-2xl text-zinc-600 dark:text-zinc-400">
            {profile.bio || "No bio yet."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}>
              <Card>
                <h2 className="text-3xl font-light">{post.title}</h2>

                <p className="mt-4 line-clamp-3 text-zinc-600 dark:text-zinc-400">
                  {post.content}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
