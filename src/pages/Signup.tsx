import { useState } from "react";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

export default function Signup() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        alert(error.message);

        return;
      }

      if (data.user) {
        const username = email.split("@")[0].toLowerCase();

        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: name,
          username,
        });
      }

      window.location.href = "/explore";
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <section className="flex min-h-screen items-center justify-center px-6">
        <div
          className="
            w-full max-w-md rounded-3xl
            border border-zinc-200
            bg-white p-8 shadow-sm
            dark:border-zinc-800
            dark:bg-zinc-950
          "
        >
          <h1
            className="
              text-4xl font-light
              tracking-tight
              text-black
              dark:text-white
            "
          >
            Create account
          </h1>

          <p
            className="
              mt-3 text-zinc-600
              dark:text-zinc-400
            "
          >
            Join Chatter and start publishing today.
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="
                w-full rounded-2xl border
                border-zinc-300
                bg-white
                px-4 py-3
                text-black
                outline-none transition
                placeholder:text-zinc-400
                focus:border-black
                dark:border-zinc-700
                dark:bg-zinc-900
                dark:text-white
                dark:placeholder:text-zinc-500
                dark:focus:border-white
              "
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="
                w-full rounded-2xl border
                border-zinc-300
                bg-white
                px-4 py-3
                text-black
                outline-none transition
                placeholder:text-zinc-400
                focus:border-black
                dark:border-zinc-700
                dark:bg-zinc-900
                dark:text-white
                dark:placeholder:text-zinc-500
                dark:focus:border-white
              "
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="
                w-full rounded-2xl border
                border-zinc-300
                bg-white
                px-4 py-3
                text-black
                outline-none transition
                placeholder:text-zinc-400
                focus:border-black
                dark:border-zinc-700
                dark:bg-zinc-900
                dark:text-white
                dark:placeholder:text-zinc-500
                dark:focus:border-white
              "
            />

            <div className="pt-2">
              <button
                onClick={handleSignup}
                disabled={loading}
                className="
                  rounded-full bg-black
                  px-6 py-3 text-white
                  transition hover:scale-[1.02]
                  dark:bg-white
                  dark:text-black
                "
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
