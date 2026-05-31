import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import type { ReactNode } from "react"

import type { User } from "@supabase/supabase-js"

import { supabase } from "../lib/supabase"

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)

  async function ensureProfile(user: User) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,

        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",

        username:
          user.email?.split("@")[0].toLowerCase() ||
          `user_${user.id.slice(0, 8)}`,

        avatar_url:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "",
      })
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const currentUser = session?.user ?? null

      setUser(currentUser)

    if (currentUser) {
  ensureProfile(currentUser).catch(console.error)
}

      setLoading(false)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser =
          session?.user ?? null

        setUser(currentUser)

      if (currentUser) {
  ensureProfile(currentUser).catch(console.error)
}

setLoading(false)
      }
    )

    return () =>
      subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)