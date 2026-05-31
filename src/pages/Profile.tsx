import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type Profile = {
  full_name: string;
  username: string;
  bio: string;
  avatar_url?: string;
};

export default function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    likes: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);

    fetchStats();
  }

  async function fetchStats() {
    if (!user) return;

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", user.id);

    const { data: followersData } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", user.id);

    const totalLikes =
      postsData?.reduce((acc, post) => acc + (post.likes_count || 0), 0) || 0;

    setStats({
      posts: postsData?.length || 0,
      followers: followersData?.length || 0,
      likes: totalLikes,
    });
  }

  async function handleAvatarUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!user) return;

    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();

      const fileName = `${user.id}.${fileExt}`;

      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setProfile({
        ...profile!,
        avatar_url: avatarUrl,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateProfile() {
    if (!user || !profile) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq("id", user.id);

      if (error) {
        alert(error.message);

        return;
      }

      alert("Profile updated!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <MainLayout>
        <div
          className="
            flex min-h-screen
            items-center
            justify-center
          "
        >
          Loading profile...
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
          max-w-6xl
          overflow-x-hidden
          px-4 py-24
          sm:px-6
        "
      >
        {/* PROFILE HEADER */}

        <div
          className="
            relative overflow-hidden
            rounded-[2rem]
            border border-zinc-200
            bg-white p-8
            dark:border-zinc-800
            dark:bg-zinc-900
            md:p-12
          "
        >
          <div
            className="
              absolute right-0 top-0
              h-64 w-64
              rounded-full
              bg-indigo-500/10
              blur-3xl
            "
          />

          <div
            className="
              relative z-10
              flex flex-col gap-8
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                flex flex-col gap-6
                sm:flex-row
                sm:items-center
              "
            >
              {/* AVATAR */}

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="
                    h-28 w-28
                    rounded-full
                    object-cover
                    ring-4
                    ring-zinc-100
                    dark:ring-zinc-800
                  "
                />
              ) : (
                <div
                  className="
                    flex h-28 w-28
                    items-center
                    justify-center
                    rounded-full
                    bg-zinc-200
                    text-4xl
                    font-light
                    dark:bg-zinc-800
                  "
                >
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* INFO */}

              <div>
                <p
                  className="
                    text-sm uppercase
                    tracking-[0.2em]
                    text-zinc-500
                  "
                >
                  Creator Profile
                </p>

                <h1
                  className="
                    mt-3 text-4xl
                    font-light
                    tracking-tight
                    md:text-6xl
                  "
                >
                  {profile.full_name || profile.username}
                </h1>

                <p
                  className="
                    mt-3 text-zinc-500
                  "
                >
                  @{profile.username}
                </p>

                <div className="mt-5">
                  <label
                    className="
      inline-flex cursor-pointer
      items-center gap-2
      rounded-full border
      border-zinc-300
      px-4 py-2
      text-sm transition
      hover:bg-zinc-100
      dark:border-zinc-700
      dark:hover:bg-zinc-800
    "
                  >
                    Upload Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <p
                  className="
                    mt-6 max-w-2xl
                    leading-relaxed
                    text-zinc-600
                    dark:text-zinc-400
                  "
                >
                  {profile.bio || "No bio added yet."}
                </p>
              </div>
            </div>

            {/* STATS */}

            <div
              className="
                grid grid-cols-3
                gap-4
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-zinc-100 p-5
                  text-center
                  dark:bg-zinc-800
                "
              >
                <p
                  className="
                    text-3xl
                    font-light
                  "
                >
                  {stats.posts}
                </p>

                <p
                  className="
                    mt-2 text-xs
                    uppercase
                    tracking-[0.2em]
                    text-zinc-500
                  "
                >
                  Posts
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-zinc-100 p-5
                  text-center
                  dark:bg-zinc-800
                "
              >
                <p
                  className="
                    text-3xl
                    font-light
                  "
                >
                  {stats.followers}
                </p>

                <p
                  className="
                    mt-2 text-xs
                    uppercase
                    tracking-[0.2em]
                    text-zinc-500
                  "
                >
                  Followers
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-zinc-100 p-5
                  text-center
                  dark:bg-zinc-800
                "
              >
                <p
                  className="
                    text-3xl
                    font-light
                  "
                >
                  {stats.likes}
                </p>

                <p
                  className="
                    mt-2 text-xs
                    uppercase
                    tracking-[0.2em]
                    text-zinc-500
                  "
                >
                  Likes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS */}

        <div
          className="
            mt-12 rounded-[2rem]
            border border-zinc-200
            bg-white p-8
            dark:border-zinc-800
            dark:bg-zinc-900
            md:p-10
          "
        >
          <div className="mb-10">
            <p
              className="
                text-sm uppercase
                tracking-[0.2em]
                text-zinc-500
              "
            >
              Account Settings
            </p>

            <h2
              className="
                mt-4 text-3xl
                font-light
                tracking-tight
                md:text-4xl
              "
            >
              Edit Profile
            </h2>
          </div>

          <div className="space-y-8">
            {/* FULL NAME */}

            <div>
              <label
                className="
                  mb-3 block text-sm
                  text-zinc-500
                "
              >
                Full Name
              </label>

              <input
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value,
                  })
                }
                className="
                  w-full rounded-2xl
                  border border-zinc-300
                  bg-white px-5 py-4
                  outline-none
                  transition
                  focus:border-black
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:focus:border-white
                "
              />
            </div>

            {/* USERNAME */}

            <div>
              <label
                className="
                  mb-3 block text-sm
                  text-zinc-500
                "
              >
                Username
              </label>

              <input
                value={profile.username || ""}
                disabled
                className="
                  w-full rounded-2xl
                  border border-zinc-300
                  bg-zinc-100 px-5 py-4
                  outline-none
                  dark:border-zinc-700
                  dark:bg-zinc-800
                "
              />
            </div>

            {/* BIO */}

            <div>
              <label
                className="
                  mb-3 block text-sm
                  text-zinc-500
                "
              >
                Bio
              </label>

              <textarea
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio: e.target.value,
                  })
                }
                rows={6}
                className="
                  w-full rounded-2xl
                  border border-zinc-300
                  bg-white px-5 py-4
                  outline-none
                  transition
                  focus:border-black
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:focus:border-white
                "
              />
            </div>

            {/* SAVE BUTTON */}

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="
                rounded-full
                bg-zinc-800 px-6 py-3
                text-sm font-medium
                text-white
                transition-all duration-300
                hover:scale-[1.02]
                hover:bg-zinc-700
                dark:bg-zinc-200
                dark:text-zinc-900
                dark:hover:bg-white
              "
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
