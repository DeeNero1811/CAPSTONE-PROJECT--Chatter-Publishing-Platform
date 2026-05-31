import { useState } from "react";

import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);

        return;
      }

      navigate("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setOauthLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOauthLoading(false);
    }
  }

  async function signInWithGithub() {
    try {
      setOauthLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",

        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <MainLayout>
      <section className="flex min-h-screen items-center justify-center px-6">
        <div
          className="
            w-full max-w-md rounded-3xl
            border border-zinc-200
            bg-white p-8
            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          <h1 className="text-4xl font-light tracking-tight">Welcome back</h1>

          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Sign in to continue writing and reading.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={signInWithGoogle}
              disabled={oauthLoading}
              className="
                flex w-full items-center
                justify-center gap-3
                rounded-2xl border
                border-zinc-300 px-4 py-3
                transition hover:bg-zinc-100
                dark:border-zinc-700
                dark:hover:bg-zinc-800
              "
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            <button
              onClick={signInWithGithub}
              disabled={oauthLoading}
              className="
                flex w-full items-center
                justify-center gap-3
                rounded-2xl border
                border-zinc-300 px-4 py-3
                transition hover:bg-zinc-100
                dark:border-zinc-700
                dark:hover:bg-zinc-800
              "
            >
              <span className="font-medium">GH</span>
              Continue with GitHub
            </button>
          </div>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />

            <span className="text-sm text-zinc-500">OR</span>

            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="
                w-full rounded-2xl
                border border-zinc-300
                bg-white px-4 py-3
                outline-none transition
                dark:border-zinc-700
                dark:bg-zinc-900
              "
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="
                w-full rounded-2xl
                border border-zinc-300
                bg-white px-4 py-3
                outline-none transition
                dark:border-zinc-700
                dark:bg-zinc-900
              "
            />

            <div className="pt-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="
                  rounded-full bg-black
                  px-6 py-3 text-white
                  transition hover:scale-[1.02]
                  dark:bg-white
                  dark:text-black
                "
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
