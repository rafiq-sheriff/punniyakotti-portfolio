import React, { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from './AdminLogin'

interface AdminLayoutProps {
  children: (userSession: any) => ReactNode
  onNavigateHome: () => void
}

export default function AdminLayout({ children, onNavigateHome }: AdminLayoutProps) {
  const [session, setSession] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#A85532] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-[#A85532] uppercase font-bold">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin onLoginSuccess={() => setAuthLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200/80 px-6 lg:px-12 py-4 sticky top-0 z-50 flex items-center justify-between backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
            }}
            className="font-['Cormorant_Garamond'] font-bold text-xl sm:text-2xl tracking-[0.08em] uppercase text-[#1c1917] hover:text-[#A85532] transition-colors"
          >
            PUNNIYAKOTTI <span className="text-xs text-[#A85532] font-['Manrope'] font-bold tracking-widest ml-2 bg-[#A85532]/10 px-2 py-0.5 rounded-md">CMS</span>
          </a>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] uppercase font-mono font-bold tracking-wider rounded-full">
            ● Authorized Session
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-xs text-stone-500 font-mono">
            {session.user.email}
          </span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-700 hover:text-[#A85532] px-3.5 py-2 border border-stone-200 rounded-xl transition-colors hidden sm:block font-medium bg-stone-50 hover:bg-stone-100"
          >
            Preview Live Site ↗
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold tracking-wider uppercase px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 max-w-[1600px] mx-auto w-full">
        {children(session)}
      </main>
    </div>
  )
}
