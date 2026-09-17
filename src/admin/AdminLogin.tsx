import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.session) {
        onLoginSuccess()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Accent Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #A85532 0%, transparent 70%)' }}
      />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white border border-[#e7e2d7] rounded-3xl p-8 sm:p-10 shadow-xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="font-['Cormorant_Garamond'] font-bold text-3xl tracking-[0.1em] uppercase text-[#1c1917] block">
              PUNNIYAKOTTI
            </span>
            <span className="text-[11px] font-['Manrope'] tracking-[0.25em] uppercase text-[#A85532] font-bold mt-2 block">
              Admin Portal Login
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 text-xs leading-relaxed font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-stone-600 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@punniyakottistudio.com"
                className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1c1917] placeholder-stone-400 focus:outline-none focus:border-[#A85532] focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-stone-600 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1c1917] placeholder-stone-400 focus:outline-none focus:border-[#A85532] focus:bg-white transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl text-xs font-['Manrope'] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md ${
                loading
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#A85532] text-white hover:bg-[#1c1917] cursor-pointer'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <a
              href="/"
              className="text-[11px] font-['Manrope'] font-semibold tracking-[0.18em] uppercase text-stone-500 hover:text-[#A85532] transition-colors"
            >
              ← Back to Live Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
