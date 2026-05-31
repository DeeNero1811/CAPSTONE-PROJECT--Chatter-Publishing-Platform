import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

export default function Write() {
  const { user } = useAuth();

  const { id } = useParams();

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [coverImage, setCoverImage] = useState("");

  const [tags, setTags] = useState("");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [lastSaved, setLastSaved] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSaveDraft() {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("posts")
        .upsert({
          id: editingPostId || undefined,
          title,
          content,
          cover_image: coverImage,

          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),

          status: "draft",

          author_id: user.id,
          author_username: user.email?.split("@")[0].toLowerCase(),
        })
        .select()
        .single();

      if (error) {
        alert(error.message);

        return;
      }

      if (!editingPostId) {
        setEditingPostId(data.id);
      }

      alert("Draft saved successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("posts").upsert({
        id: editingPostId || undefined,

        title,
        content,
        cover_image: coverImage,

        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        status: "published",

        author_id: user.id,
        author_username: user.email?.split("@")[0].toLowerCase(),
      });

      if (error) {
        alert(error.message);

        return;
      }

      alert("Post published successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (error) {
      console.error(error);

      alert("Image upload failed");

      return;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    const imageMarkdown = `\n![image](${data.publicUrl})\n`;

    setContent((prev) => prev + imageMarkdown);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const fileName = `cover-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (error) {
      alert("Cover upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    setCoverImage(data.publicUrl);
  }

  async function autoSaveDraft() {
    if (!user) return;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("posts")
        .upsert({
          id: editingPostId || undefined,

          title,
          content,
          cover_image: coverImage,

          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),

          status: "draft",

          author_id: user.id,
          author_username: user.email?.split("@")[0].toLowerCase(),
        })
        .select()
        .single();

      if (error) {
        console.error(error);

        return;
      }

      if (!editingPostId) {
        setEditingPostId(data.id);
      }

      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function fetchDraft() {
    if (!id) return;

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

      setTitle(data.title || "");

      setContent(data.content || "");

      setCoverImage(data.cover_image || "");

      setTags(data.tags?.join(", ") || "");

      setEditingPostId(data.id);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (id) {
      fetchDraft();
    }
  }, [id]);

  useEffect(() => {
    if (!title && !content) return;

    const interval = setInterval(() => {
      autoSaveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [title, content]);

  return (
    <MainLayout>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="mb-4 text-5xl font-light tracking-tight">Write Story</h1>

        <div className="mb-6 text-sm text-zinc-500">
          {saving
            ? "Saving draft..."
            : lastSaved
              ? `Saved at ${lastSaved}`
              : "Draft not saved yet"}
        </div>

        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            mb-8 w-full border-none
            bg-transparent text-5xl
            font-light tracking-tight
            outline-none
            placeholder:text-zinc-400
          "
        />

        {/* COVER IMAGE */}

        <div className="mb-6">
          <label
            className="
      cursor-pointer rounded-full
      border border-zinc-300
      px-5 py-3 text-sm transition
      hover:bg-zinc-100
      dark:border-zinc-700
      dark:hover:bg-zinc-800
    "
          >
            Upload Cover Image
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </label>

          {coverImage && (
            <img
              src={coverImage}
              alt="cover"
              className="
        mt-6 h-64 w-full
        rounded-3xl
        object-cover
      "
            />
          )}
        </div>

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="
    mb-6 w-full rounded-2xl
    border border-zinc-300
    bg-white px-5 py-4
    outline-none
    dark:border-zinc-700
    dark:bg-zinc-900
  "
        />

        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="
              rounded-full border border-zinc-300
              px-5 py-3 text-sm transition
              hover:bg-zinc-100
              dark:border-zinc-700
              dark:hover:bg-zinc-800
            "
          >
            Save Draft
          </button>

          <label
            className="
    cursor-pointer rounded-full
    border border-zinc-300
    px-5 py-3 text-sm transition
    hover:bg-zinc-100
    dark:border-zinc-700
    dark:hover:bg-zinc-800
  "
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handlePublish}
            disabled={loading}
            className="
              rounded-full bg-black px-5 py-3
              text-sm text-white transition
              hover:scale-[1.02]
              dark:bg-white dark:text-black
            "
          >
            Publish
          </button>
        </div>

        <div
          data-color-mode="light"
          className="
            overflow-hidden rounded-3xl
            border border-zinc-200
            dark:border-zinc-800
          "
        >
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            height={600}
          />
        </div>
      </section>
    </MainLayout>
  );
}
