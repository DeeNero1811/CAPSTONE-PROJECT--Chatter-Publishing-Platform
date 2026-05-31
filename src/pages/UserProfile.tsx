import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Card from "../components/ui/Card";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  bio: string;

  avatar_url?: string;

  website?: string;

  twitter?: string;

  github?: string;

  location?: string;

  tagline?: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  views?: number;
};

function stripMarkdown(text: string) {
  return text
    .replace(/[#_*>\-\[\]]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

export default function UserProfile() {
  const { user } = useAuth();

  const { username } = useParams();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);

  const [following, setFollowing] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);

  const [followingCount, setFollowingCount] = useState(0);

  const [followers, setFollowers] = useState<any[]>([]);

  const [followingUsers, setFollowingUsers] = useState<any[]>([]);

  const [showFollowers, setShowFollowers] = useState(false);

  const [showFollowing, setShowFollowing] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [editing, setEditing] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");

  const [website, setWebsite] = useState("");

  const [twitter, setTwitter] = useState("");

  const [github, setGithub] = useState("");

  const [location, setLocation] = useState("");

  const [tagline, setTagline] = useState("");

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      console.error(error);

      setLoading(false);

      return;
    }

    setProfile(data);

    setAvatarUrl(data.avatar_url || "");

    setWebsite(data.website || "");

    setTwitter(data.twitter || "");

    setGithub(data.github || "");

    setLocation(data.location || "");

    setTagline(data.tagline || "");

    fetchPosts(data.id);

    fetchFollowStatus(data.id);

    fetchFollowersCount(data.id);

    fetchFollowingCount(data.id);

    fetchFollowers(data.id);

    fetchFollowingUsers(data.id);
  }

  async function saveProfile() {
    if (!user || !profile) return;

    await supabase
      .from("profiles")
      .update({
        website,
        twitter,
        github,
        location,
        tagline,
      })
      .eq("id", user.id);

    setProfile({
      ...profile,
      website,
      twitter,
      github,
      location,
      tagline,
    });

    setEditing(false);
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;

    if (!user) return;

    const file = e.target.files[0];

    const filePath = `${user.id}-${Date.now()}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);

      setUploading(false);

      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);

    setUploading(false);
  }

  async function fetchFollowStatus(profileId: string) {
    if (!user) return;

    const { data } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", profileId)
      .maybeSingle();

    setFollowing(!!data);
  }

  async function fetchFollowersCount(profileId: string) {
    const { data } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", profileId);

    setFollowersCount(data?.length || 0);
  }

  async function fetchFollowingCount(profileId: string) {
    const { data } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", profileId);

    setFollowingCount(data?.length || 0);
  }

  async function fetchFollowers(profileId: string) {
    const { data } = await supabase
      .from("followers")
      .select("follower_id")
      .eq("following_id", profileId);

    if (!data) return;

    const ids = data.map((item) => item.follower_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", ids);

    setFollowers(profiles || []);
  }

  async function fetchFollowingUsers(profileId: string) {
    const { data } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", profileId);

    if (!data) return;

    const ids = data.map((item) => item.following_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", ids);

    setFollowingUsers(profiles || []);
  }

  async function toggleFollow() {
    if (!user || !profile) return;

    if (user.id === profile.id) {
      return;
    }

    if (following) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.id);

      setFollowing(false);

      setFollowersCount((prev) => prev - 1);
    } else {
      await supabase.from("followers").insert({
        follower_id: user.id,
        following_id: profile.id,
      });

      await supabase.from("notifications").insert({
        user_id: profile.id,

        type: "follow",

        message: `${user.email?.split("@")[0]} followed you.`,

        sender_username: user.email?.split("@")[0].toLowerCase(),
      });

      setFollowing(true);

      setFollowersCount((prev) => prev + 1);
    }
  }

  async function fetchPosts(userId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", userId)
      .eq("status", "published")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      return;
    }

    setPosts(data || []);

    setLoading(false);
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
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 border-b border-zinc-200 pb-12 dark:border-zinc-800">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Creator Profile
          </p>

          <div className="mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="
                  h-28 w-28 rounded-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex h-28 w-28
                  items-center justify-center
                  rounded-full bg-zinc-200
                  text-3xl font-light
                  dark:bg-zinc-800
                "
              >
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="mt-6 text-6xl font-light tracking-tight">
            @{profile.username}
          </h1>

          <p className="mt-4 text-xl text-zinc-500">
            {tagline || "Creator on Chatter"}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {profile.bio || "No bio yet."}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-500">
            {location && <span>📍 {location}</span>}

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black dark:hover:text-white"
              >
                Website
              </a>
            )}

            {twitter && (
              <a
                href={`https://twitter.com/${twitter}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black dark:hover:text-white"
              >
                Twitter/X
              </a>
            )}

            {github && (
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black dark:hover:text-white"
              >
                GitHub
              </a>
            )}
          </div>

          {user?.id === profile.id && (
            <div className="mt-6 flex flex-wrap gap-4">
              <label
                className="
                  inline-flex cursor-pointer
                  rounded-full bg-black
                  px-5 py-2 text-sm
                  text-white transition
                  hover:scale-[1.02]
                  dark:bg-white
                  dark:text-black
                "
              >
                {uploading ? "Uploading..." : "Upload Avatar"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setEditing(!editing)}
                className="
                  rounded-full border
                  border-zinc-300
                  px-5 py-2 text-sm
                  transition
                  hover:bg-zinc-100
                  dark:border-zinc-700
                  dark:hover:bg-zinc-800
                "
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          )}

          {editing && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="
                  rounded-2xl border
                  border-zinc-300 bg-white
                  px-5 py-3 outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-900
                "
              />

              <input
                type="text"
                placeholder="Twitter/X username"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="
                  rounded-2xl border
                  border-zinc-300 bg-white
                  px-5 py-3 outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-900
                "
              />

              <input
                type="text"
                placeholder="GitHub username"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="
                  rounded-2xl border
                  border-zinc-300 bg-white
                  px-5 py-3 outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-900
                "
              />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="
                  rounded-2xl border
                  border-zinc-300 bg-white
                  px-5 py-3 outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-900
                "
              />

              <input
                type="text"
                placeholder="Creator tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="
                  rounded-2xl border
                  border-zinc-300 bg-white
                  px-5 py-3 outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-900 md:col-span-2
                "
              />

              <button
                onClick={saveProfile}
                className="
                  rounded-full bg-black
                  px-6 py-3 text-sm text-white
                  transition hover:scale-[1.02]
                  dark:bg-white dark:text-black
                "
              >
                Save Profile
              </button>
            </div>
          )}

          <p className="mt-6 text-sm text-zinc-500">
            {posts.length} published articles
          </p>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={toggleFollow}
              className="
                rounded-full bg-black
                px-6 py-3 text-sm text-white
                transition hover:scale-[1.02]
                dark:bg-white dark:text-black
              "
            >
              {following ? "Following" : "Follow"}
            </button>

            <button
              onClick={() => setShowFollowers(true)}
              className="text-sm text-zinc-500 transition hover:text-black dark:hover:text-white"
            >
              {followersCount} followers
            </button>

            <button
              onClick={() => setShowFollowing(true)}
              className="text-sm text-zinc-500 transition hover:text-black dark:hover:text-white"
            >
              {followingCount} following
            </button>
          </div>
        </div>

        {showFollowers && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-light">Followers</h2>

            <div className="space-y-3">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  to={`/profile/${follower.username}`}
                  className="block text-zinc-600 transition hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  @{follower.username}
                </Link>
              ))}
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-light">Following</h2>

            <div className="space-y-3">
              {followingUsers.map((following) => (
                <Link
                  key={following.id}
                  to={`/profile/${following.username}`}
                  className="block text-zinc-600 transition hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  @{following.username}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}>
              <Card>
                <h2 className="text-3xl font-light leading-tight">
                  {post.title}
                </h2>

                <p className="mt-4 line-clamp-3 text-zinc-600 dark:text-zinc-400">
                  {stripMarkdown(post.content)}
                </p>

                <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>

                  <span>•</span>

                  <span>{post.views || 0} views</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
