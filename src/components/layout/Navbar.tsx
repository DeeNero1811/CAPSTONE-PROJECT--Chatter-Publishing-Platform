import { Link, NavLink, useNavigate } from "react-router-dom";

import { PenSquare, ChevronDown, Bell, Menu, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import ThemeToggle from "../ui/ThemeToggle";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");

  const [username, setUsername] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    fetchProfile();

    fetchUnreadNotifications();

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 1500);

    const channel = supabase
      .channel(`navbar-notifications-${user.id}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },

        () => {
          fetchUnreadNotifications();
        },
      )

      .subscribe();

    return () => {
      clearInterval(interval);

      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function fetchProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, username")
      .eq("id", user.id)
      .single();

    if (data) {
      setAvatarUrl(data.avatar_url || "");

      setUsername(data.username || "");
    }
  }

  async function fetchUnreadNotifications() {
    if (!user) return;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error(error);
      return;
    }

    setUnreadCount(count || 0);
  }

  async function handleLogout() {
    setMobileMenuOpen(false);

    await supabase.auth.signOut();

    navigate("/login");
  }

  return (
    <header
      className="
        fixed top-0 z-50 w-full
        border-b border-zinc-200/50
        bg-white/80 backdrop-blur-xl
        transition
        dark:border-zinc-800
        dark:bg-black/70
      "
    >
      <nav
        className="
          flex h-16 w-full
          items-center justify-between
          px-6 md:px-10
        "
      >
        {/* LOGO */}
        <Link
          to="/"
          className="
            text-xl font-semibold
            tracking-tight
          "
        >
          Chatter
        </Link>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="
            flex items-center
            lg:hidden
          "
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* DESKTOP NAV */}
        <div
          className="
            hidden items-center gap-8
            text-sm text-zinc-600
            dark:text-zinc-300
            lg:flex
          "
        >
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              isActive ? "text-black dark:text-white" : "text-zinc-500"
            }
          >
            Explore
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/following"
                className={({ isActive }) =>
                  isActive ? "text-black dark:text-white" : "text-zinc-500"
                }
              >
                Following
              </NavLink>

              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `relative ${
                    isActive ? "text-black dark:text-white" : "text-zinc-500"
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <Bell size={18} />
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      className="
                        flex h-5
                        min-w-[20px]
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        px-1 text-[10px]
                        font-medium
                        text-white
                      "
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>

              <NavLink
                to="/write"
                className="
  flex h-11 items-center
  gap-2 rounded-full
  bg-black px-5
  text-sm font-medium
  text-white
  transition-all duration-300
  hover:bg-zinc-800
  dark:bg-white
  dark:text-black
  dark:hover:bg-zinc-200
"
              >
                <PenSquare size={16} />
                Write
              </NavLink>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="
                    flex items-center
                    gap-3
                    text-zinc-700
                    transition
                    hover:text-black
                    dark:text-zinc-300
                    dark:hover:text-white
                  "
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="
                        h-10 w-10
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-zinc-200
                        text-sm
                        font-medium
                        dark:bg-zinc-800
                      "
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span>@{username}</span>

                  <ChevronDown size={16} />
                </button>

                {open && (
                  <div
                    className="
                      absolute right-0
                      mt-4 w-56
                      rounded-2xl
                      border
                      border-zinc-200
                      bg-white p-2
                      shadow-xl
                      dark:border-zinc-800
                      dark:bg-zinc-900
                    "
                  >
                    <Link
                      to={`/profile/${username}`}
                      className="
                        block rounded-xl
                        px-4 py-3
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Profile
                    </Link>

                    <Link
                      to="/drafts"
                      className="
                        block rounded-xl
                        px-4 py-3
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Drafts
                    </Link>

                    <Link
                      to="/bookmarks"
                      className="
                        block rounded-xl
                        px-4 py-3
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Library
                    </Link>

                    <Link
                      to="/profile"
                      className="
                        block rounded-xl
                        px-4 py-3
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Settings
                    </Link>

                    <Link
                      to="/dashboard"
                      className="
                        block rounded-xl
                        px-4 py-3
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="
                        w-full rounded-xl
                        px-4 py-3
                        text-left
                        transition
                        hover:bg-zinc-100
                        dark:hover:bg-zinc-800
                      "
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "text-black dark:text-white" : "text-zinc-500"
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="
                  rounded-full
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  px-5 py-2
                  text-white
                  transition
                  hover:opacity-90
                "
              >
                Create Account
              </NavLink>
            </>
          )}

          <ThemeToggle />
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div
            className="
              absolute left-0 top-16
              flex w-full
              flex-col gap-4
              border-b
              border-zinc-200
              bg-white px-6 py-6
              animate-in
              slide-in-from-top
              duration-200
              dark:border-zinc-800
              dark:bg-black
              lg:hidden
            "
          >
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>

            {user ? (
              <>
                <Link to="/following" onClick={() => setMobileMenuOpen(false)}>
                  Following
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notifications
                </Link>

                <Link to="/write" onClick={() => setMobileMenuOpen(false)}>
                  Write
                </Link>

                <Link
                  to={`/profile/${username}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <Link to="/drafts" onClick={() => setMobileMenuOpen(false)}>
                  Drafts
                </Link>

                <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)}>
                  Library
                </Link>

                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>

                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>

                <button onClick={handleLogout} className="text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>

                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Create Account
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>
        )}
      </nav>
    </header>
  );
}
