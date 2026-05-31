import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Explore from "./pages/Explore";

import Login from "./pages/Login";

import Signup from "./pages/Signup";

import Write from "./pages/Write";

import Profile from "./pages/Profile";

import Post from "./pages/Post";

import Bookmarks from "./pages/Bookmarks";

import ProtectedRoute from "./routes/ProtectedRoute";

import Drafts from "./pages/Drafts";

import UserProfile from "./pages/UserProfile";

import Following from "./pages/Following";

import Notifications from "./pages/Notifications";

import Dashboard from "./pages/Dashboard";

import NotFound from "./pages/NotFound";

import About from "./pages/About";

import Privacy from "./pages/Privacy";

import Terms from "./pages/Terms";

export default function App() {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* EXPLORE */}
      <Route path="/explore" element={<Explore />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* POST */}
      <Route path="/post/:id" element={<Post />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* WRITE */}
      <Route
        path="/write"
        element={
          <ProtectedRoute>
            <Write />
          </ProtectedRoute>
        }
      />

      <Route
        path="/write/:id"
        element={
          <ProtectedRoute>
            <Write />
          </ProtectedRoute>
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/profile/:username" element={<UserProfile />} />

      {/* NOTIFICATIONS */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* BOOKMARKS */}
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />

      {/* FOLLOWING */}
      <Route path="/following" element={<Following />} />

      {/* DRAFTS */}
      <Route
        path="/drafts"
        element={
          <ProtectedRoute>
            <Drafts />
          </ProtectedRoute>
        }
      />

      {/* ABOUT */}
      <Route path="/about" element={<About />} />

      <Route path="/privacy" element={<Privacy />} />

      <Route path="/terms" element={<Terms />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
