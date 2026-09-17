import { useState, useEffect, useRef, useMemo, type ReactNode, type CSSProperties } from 'react'
import InteractiveHero from './components/InteractiveHero'
import HeroAnimation from './components/HeroAnimation'
import DistortedTypography from './components/DistortedTypography'
import ProjectsPage from './components/ProjectsPage'
import Preloader, { type IntroPhase } from './components/Preloader'
import puniyakottiImg from '../assets/image/puniyakotti (2).webp'
import { CMSProvider, useCMS } from './context/CMSContext'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import { extractYouTubeId, type CinematicFilm } from './lib/supabase'

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=85`

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  style = {},
  delay = 0,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface NavProps {
  currentPath: string
  onNavigate?: (path: string, el?: HTMLElement | null, hashId?: string) => void
  onNavigateWithFlash?: (path: string, el?: HTMLElement | null, hashId?: string) => void
  heroMode: 'image' | 'animation'
  onToggleHeroMode: () => void
  introPhase: IntroPhase
  navLogoRef: React.RefObject<HTMLAnchorElement | null>
}

function Nav({ currentPath, onNavigate, onNavigateWithFlash, introPhase, navLogoRef }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const isDark = false

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Portfolio', path: '/projects' },
    { label: 'Services', path: '/#services' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, itemPath: string) => {
    e.preventDefault()
    setOpen(false)
    const doNavigate = onNavigate || onNavigateWithFlash
    if (itemPath === '/' || itemPath === '/projects') {
      if (doNavigate) doNavigate(itemPath, e.currentTarget)
    } else if (itemPath.includes('#')) {
      const hashId = itemPath.split('#')[1]
      if (currentPath !== '/') {
        if (doNavigate) doNavigate('/', e.currentTarget, hashId)
      } else {
        const el = document.getElementById(hashId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  const isNavLogoVisible = introPhase !== 'loading' && introPhase !== 'loader_sliding' && introPhase !== 'brand_moving'
  const isNavContentVisible = introPhase === 'full_reveal' || introPhase === 'done'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.96)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(28,25,23,0.08)'
          : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 flex items-center justify-between"
        style={{ height: 72 }}
      >
        <a
          ref={navLogoRef}
          href="/"
          onClick={(e) => handleClick(e, '/')}
          className="font-['Cormorant_Garamond'] font-bold text-2xl sm:text-3xl tracking-[0.08em] uppercase transition-opacity duration-300 text-[#1c1917]"
          style={{
            opacity: isNavLogoVisible ? 1 : 0,
          }}
        >
          PUNNIYAKOTTI
        </a>

        <div
          className="hidden lg:flex items-center gap-9 transition-all duration-700 ease-out"
          style={{
            opacity: isNavContentVisible ? 1 : 0,
            transform: isNavContentVisible ? 'translateY(0)' : 'translateY(-12px)',
            pointerEvents: isNavContentVisible ? 'auto' : 'none',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentPath === item.path
            return (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleClick(e, item.path)}
                className="text-[13px] font-['Manrope'] font-medium tracking-[0.22em] uppercase transition-colors duration-300"
                style={{
                  color: isActive
                    ? '#A85532'
                    : 'rgba(28,25,23,0.65)',
                }}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <div
          className="flex items-center gap-3 transition-all duration-700 ease-out"
          style={{
            opacity: isNavContentVisible ? 1 : 0,
            transform: isNavContentVisible ? 'translateY(0)' : 'translateY(-12px)',
            pointerEvents: isNavContentVisible ? 'auto' : 'none',
          }}
        >
          <a
            href="https://wa.me/917708665274?text=Hello!%20I%20would%20like%20to%20book%20a%20photography%20session."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:block text-[11px] font-semibold tracking-[0.18em] uppercase px-6 py-3 border transition-all duration-350 shadow-sm rounded-[12px] border-[#A85532] text-[#A85532] hover:bg-[#A85532] hover:text-[#ffffff]"
          >
            Book a Session
          </a>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col gap-[5px] p-2 text-[#1c1917]"
            aria-label="Menu"
          >
            <span
              className="block w-6 h-px bg-current origin-center transition-all duration-300"
              style={{ transform: open ? 'rotate(45deg) translateY(6px)' : undefined }}
            />
            <span
              className="block w-6 h-px bg-current transition-all duration-300"
              style={{ opacity: open ? 0 : 1 }}
            />
            <span
              className="block w-6 h-px bg-current origin-center transition-all duration-300"
              style={{ transform: open ? 'rotate(-45deg) translateY(-6px)' : undefined }}
            />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden px-8 pb-8 pt-2 flex flex-col gap-5 border-t shadow-lg bg-white border-[#1c1917]/10 text-[#1c1917]"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              onClick={(e) => handleClick(e, item.path)}
              className={`text-sm tracking-[0.18em] uppercase font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/70'
                }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://wa.me/917708665274?text=Hello!%20I%20would%20like%20to%20book%20a%20photography%20session."
            target="_blank"
            rel="noopener noreferrer"
            className={`self-start text-[11px] font-semibold tracking-[0.18em] uppercase px-6 py-3 border rounded-[12px] ${isDark ? 'border-[#D07A55] text-[#D07A55]' : 'border-[#A85532] text-[#A85532]'
              }`}
          >
            Book a Session
          </a>
        </div>
      )}
    </nav>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
interface HeroProps {
  onNavigate?: (path: string, el?: HTMLElement | null, hashId?: string) => void
  onNavigateWithFlash?: (path: string, el?: HTMLElement | null, hashId?: string) => void
  theme: 'dark' | 'light'
  heroMode: 'image' | 'animation'
  introPhase: IntroPhase
}

function Hero({ onNavigate, onNavigateWithFlash, theme, heroMode, introPhase }: HeroProps) {
  const doNavigate = onNavigate || onNavigateWithFlash
  if (heroMode === 'animation') {
    return <HeroAnimation onNavigate={doNavigate} theme={theme} />
  }

  const isDark = theme === 'dark'
  const isPortfolioVisible = introPhase === 'portfolio_reveal' || introPhase === 'hero_image_reveal' || introPhase === 'full_reveal' || introPhase === 'done'
  const isHeroImageVisible = introPhase === 'hero_image_reveal' || introPhase === 'full_reveal' || introPhase === 'done'
  const isHeroContentVisible = introPhase === 'full_reveal' || introPhase === 'done'

  const heroAssetSrc = '/assets/image/hero/hero.webp'

  return (
    <section
      className={`relative w-full overflow-hidden select-none transition-colors duration-700 ease-in-out ${isDark ? 'bg-black' : 'bg-white'
        }`}
      style={{ height: '100svh', minHeight: 680 }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={heroAssetSrc}
          alt="Punniyakotti Photography Studio Hero"
          decoding="async"
          className="w-[500px] h-[500px] max-w-[92vw] max-h-[70vh] object-cover md:w-full md:h-full md:max-w-none md:max-h-none md:object-cover transition-all duration-700 ease-in-out pointer-events-none origin-center"
          style={{
            opacity: isHeroImageVisible ? 1 : 0,
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-auto select-none overflow-hidden px-2 transition-all duration-700 ease-out"
        style={{
          opacity: isPortfolioVisible ? 1 : 0,
          transform: isPortfolioVisible ? 'scale(1)' : 'scale(0.92)',
        }}
      >
        <DistortedTypography theme={theme} text="PORTFOLIO" />
      </div>

      <div
        className={`absolute inset-0 z-[6] pointer-events-none transition-all duration-700 ease-in-out ${isDark
          ? 'bg-gradient-to-t from-black/60 via-transparent to-black/30'
          : 'bg-gradient-to-t from-white/40 via-transparent to-white/20'
          }`}
      />

      <div
        className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 pt-24 pb-12 flex flex-col justify-between pointer-events-none transition-all duration-800 ease-out"
        style={{
          opacity: isHeroContentVisible ? 1 : 0,
          transform: isHeroContentVisible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
          <div
            className={`pointer-events-auto inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-[12px] backdrop-blur-md shadow-lg ${isDark
              ? 'border border-[#D07A55]/35 bg-black/75'
              : 'border border-[#A85532]/35 bg-white/85'
              }`}
            style={{ animation: 'fadeUp 0.85s ease 0.2s both' }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'
                  }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'
                  }`}
              />
            </span>
            <span
              className={`text-[12px] sm:text-[13px] font-['Manrope'] font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase whitespace-nowrap ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
                }`}
            >
              BEHIND THE LENS
            </span>
          </div>

          <div
            className={`pointer-events-auto inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4.5 py-2 rounded-[12px] backdrop-blur-md shadow-lg ${isDark
              ? 'border border-[#f2ece0]/20 bg-black/75 text-[#f2ece0]/90'
              : 'border border-[#1c1917]/15 bg-white/85 text-[#1c1917]'
              }`}
            style={{ animation: 'fadeUp 0.85s ease 0.3s both' }}
          >
            <span className="text-[12px] sm:text-[13px] font-['Manrope'] font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase whitespace-nowrap">
              People <span className={isDark ? 'text-[#D07A55] mx-1' : 'text-[#A85532] mx-1'}>·</span> Emotion <span className={isDark ? 'text-[#D07A55] mx-1' : 'text-[#A85532] mx-1'}>·</span> Moments
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-5 sm:gap-8">
          <div className="pointer-events-auto max-w-none sm:max-w-2xl lg:max-w-4xl">
            <h1
              className="leading-[0.95] drop-shadow-md"
              style={{
                animation: 'fadeUp 0.9s ease 0.4s both',
              }}
            >
              <span
                className={`font-['Cormorant_Garamond'] font-semibold block whitespace-nowrap ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'
                  }`}
                style={{ fontSize: 'clamp(48px, 10vw, 88px)' }}
              >
                I Capture
              </span>
              <span
                className={`font-['Cormorant_Garamond'] font-bold italic block whitespace-nowrap ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
                  }`}
                style={{ fontSize: 'clamp(48px, 10vw, 88px)' }}
              >
                What Words Can't
              </span>
            </h1>
          </div>

          <div
            className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:justify-end sm:mb-1"
            style={{ animation: 'fadeUp 0.9s ease 0.7s both' }}
          >
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault()
                if (doNavigate) {
                  doNavigate('/projects', e.currentTarget)
                }
              }}
              className={`group inline-flex items-center justify-center gap-3 text-[14px] sm:text-[14px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-8 py-4 transition-all duration-350 shadow-xl rounded-[12px] w-full sm:w-auto whitespace-nowrap ${isDark
                ? 'bg-[#D07A55] text-[#0c0b09] hover:bg-[#f2ece0]'
                : 'bg-[#A85532] text-[#ffffff] hover:bg-[#1c1917]'
                }`}
            >
              <span>SEE THE STORIES</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="https://wa.me/917708665274?text=Hello!%20I%20would%20like%20to%20book%20a%20photography%20session."
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center text-[14px] sm:text-[14px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-8 py-4 border transition-all duration-350 backdrop-blur-sm shadow-md rounded-[12px] w-full sm:w-auto whitespace-nowrap ${isDark
                ? 'border-[#f2ece0]/30 text-[#f2ece0] hover:border-[#D07A55] hover:text-[#D07A55]'
                : 'border-[#1c1917]/25 bg-white/60 text-[#1c1917] hover:border-[#A85532] hover:text-[#A85532]'
                }`}
            >
              BOOK A SESSION
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection({ theme }: { theme: 'dark' | 'light' }) {
  const { getSectionAsset } = useCMS()
  const isDark = theme === 'dark'
  const aboutAsset = getSectionAsset('about_portrait', puniyakottiImg)

  return (
    <section id="about" className={`py-28 lg:py-40 relative overflow-hidden transition-colors duration-400 ${isDark ? 'bg-[#0c0b09]' : 'bg-white'}`}>
      <div
        className="absolute top-1/2 -right-48 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${isDark ? '#D07A55' : '#A85532'} 0%, transparent 70%)` }}
      />

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 grid lg:grid-cols-[1.15fr_1fr] gap-16 lg:gap-24 items-center relative z-10">
        <Reveal>
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-[12px] mb-6 ${isDark ? 'bg-[#D07A55]/10 border border-[#D07A55]/30' : 'bg-[#A85532]/10 border border-[#A85532]/30'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'}`} />
              <span className={`text-[11px] tracking-[0.3em] uppercase font-semibold ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>About Me</span>
            </div>

            <h2
              className={`font-['Cormorant_Garamond'] font-semibold leading-[1.12] mb-8 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.6rem)' }}
            >
              Capturing Genuine Emotions,<br />
              <span className={`italic font-normal ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Crafting Unforgettable Moments</span>
            </h2>

            <div className={`space-y-6 text-base leading-[1.85] font-light ${isDark ? 'text-[#f2ece0]/80' : 'text-[#1c1917]/80'}`}>
              <p>
                I’m Punniyakotti, a photographer and event planner with 7 years of experience in photography and 5 years in creating memorable events. I’m passionate about capturing genuine emotions and turning special occasions into experiences worth remembering.
              </p>
              <p>
                With a B.Tech in Information Technology, I bring together creativity, technical expertise, and attention to detail in everything I do. Whether behind the camera or planning an event, I focus on creating meaningful moments that tell a story.
              </p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 mt-10 border-t ${isDark ? 'border-[#f2ece0]/10' : 'border-[#1c1917]/10'}`}>
              <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#14120e]/60 border-[#f2ece0]/08' : 'bg-white border-[#e7e2d7]'}`}>
                <p className={`font-['Cormorant_Garamond'] font-bold text-2xl ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>7 Years</p>
                <p className={`text-[11px] font-['Manrope'] tracking-[0.15em] uppercase mt-1 font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/65'}`}>Photography</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#14120e]/60 border-[#f2ece0]/08' : 'bg-white border-[#e7e2d7]'}`}>
                <p className={`font-['Cormorant_Garamond'] font-bold text-2xl ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>5 Years</p>
                <p className={`text-[11px] font-['Manrope'] tracking-[0.15em] uppercase mt-1 font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/65'}`}>Event Planning</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#14120e]/60 border-[#f2ece0]/08' : 'bg-white border-[#e7e2d7]'}`}>
                <p className={`font-['Cormorant_Garamond'] font-bold text-2xl ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>B.Tech IT</p>
                <p className={`text-[11px] font-['Manrope'] tracking-[0.15em] uppercase mt-1 font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/65'}`}>Tech & Precision</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-[11px] font-semibold tracking-[0.22em] uppercase px-7 py-3.5 transition-colors duration-300 rounded-[12px] shadow-md ${isDark ? 'bg-[#D07A55] text-[#0c0b09] hover:bg-[#f2ece0]' : 'bg-[#A85532] text-[#ffffff] hover:bg-[#1c1917]'
                  }`}
              >
                Get In Touch
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-[11px] tracking-[0.22em] uppercase font-medium inline-flex items-center gap-2 border-b pb-1 transition-colors duration-300 ${isDark
                  ? 'text-[#f2ece0]/70 border-[#f2ece0]/30 hover:text-[#D07A55] hover:border-[#D07A55]'
                  : 'text-[#1c1917]/75 border-[#1c1917]/30 hover:text-[#A85532] hover:border-[#A85532]'
                  }`}
              >
                Explore Services <span>→</span>
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="relative mx-auto lg:mx-0 max-w-[500px]">
            <div className={`absolute -inset-4 border rounded-2xl pointer-events-none hidden sm:block ${isDark ? 'border-[#D07A55]/25' : 'border-[#A85532]/30'
              }`} />

            <div className={`relative rounded-2xl overflow-hidden border shadow-xl ${isDark ? 'border-[#f2ece0]/10 bg-[#14120e]' : 'border-[#e7e2d7] bg-white'
              }`}>
              <img
                src={aboutAsset.src}
                alt="Punniyakotti - Photographer & Event Planner"
                decoding="async"
                className="w-full h-auto object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                style={{ aspectRatio: '4/3' }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none ${isDark ? 'from-[#0c0b09]/80 via-transparent to-transparent' : 'from-[#fbf9f5]/40 via-transparent to-transparent'
                }`} />
            </div>

            <div className={`absolute -bottom-6 -left-4 sm:left-6 border p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md ${isDark ? 'bg-[#161410] border-[#D07A55]/40 text-[#f2ece0]' : 'bg-white border-[#A85532]/40 text-[#1c1917]'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#D07A55]/15 border border-[#D07A55]/30 text-[#D07A55]' : 'bg-[#A85532]/15 border border-[#A85532]/30 text-[#A85532]'
                  }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-['Cormorant_Garamond'] font-bold text-xl leading-none">7+ Years</p>
                  <p className={`text-[10px] font-['Manrope'] tracking-[0.18em] uppercase font-semibold mt-1 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Creative Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
const DEFAULT_SERVICES = [
  { id: 'service_1', title: 'Wedding Photography', desc: 'Every emotion, every glance — preserved in frames that outlast time.', defaultImg: unsplash('1735052712464-9d24b69be5f5', 640, 480) },
  { id: 'service_2', title: 'Wedding Films', desc: 'Cinematic wedding films that relive your love story with every viewing.', defaultImg: unsplash('1519741196428-6a2175fa2557', 640, 480) },
  { id: 'service_3', title: 'Pre-Wedding Photography', desc: 'Editorial pre-wedding shoots that tell your story before the ceremony.', defaultImg: unsplash('1633104502699-b2ecf0fee294', 640, 480) },
  { id: 'service_4', title: 'Event Photography', desc: 'From concerts to cultural celebrations — we document the energy.', defaultImg: unsplash('1764255510960-deee566a91f0', 640, 480) },
  { id: 'service_5', title: 'Event Videography', desc: 'High-production highlight reels for every event, large or intimate.', defaultImg: unsplash('1768508947605-8c7a50aed683', 640, 480) },
  { id: 'service_6', title: 'Drone & Aerial Cinematography', desc: 'Sweeping aerial perspectives that transform how your story is told.', defaultImg: unsplash('1767050248602-26b7386901ce', 640, 480) },
]

function Services({ theme, onNavigate, onNavigateWithFlash }: { theme: 'dark' | 'light'; onNavigate?: (path: string, el?: HTMLElement | null) => void; onNavigateWithFlash?: (path: string, el?: HTMLElement | null) => void }) {
  const { getSectionAsset } = useCMS()
  const [hov, setHov] = useState<number | null>(null)
  const isDark = theme === 'dark'
  const doNavigate = onNavigate || onNavigateWithFlash

  return (
    <section id="services" className={`py-24 lg:py-36 transition-colors duration-400 ${isDark ? 'bg-[#0f0e0c]' : 'bg-white'}`}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="mb-14">
          <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-4 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>What We Do</p>
          <h2
            className={`font-['Cormorant_Garamond'] font-semibold ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
          >
            Our Services
          </h2>
        </Reveal>

        <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-px ${isDark ? 'bg-[#f2ece0]/10' : 'bg-[#1c1917]/10'}`}>
          {DEFAULT_SERVICES.map((svc, i) => {
            const assetState = getSectionAsset(svc.id, svc.defaultImg)
            if (assetState.isDisabled) return null

            return (
              <div
                key={svc.title}
                className={`relative overflow-hidden cursor-pointer ${isDark ? 'bg-[#0f0e0c]' : 'bg-white'}`}
                style={{ aspectRatio: '4/3' }}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                onClick={(e) => {
                  if (doNavigate) {
                    doNavigate('/projects', e.currentTarget)
                  }
                }}
              >
                <img
                  src={assetState.src}
                  alt={svc.title}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{ transform: hov === i ? 'scale(1.07)' : 'scale(1)', filter: isDark ? 'brightness(0.55)' : 'brightness(0.65)' }}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-7 lg:p-8"
                  style={{ background: isDark ? 'linear-gradient(to top, rgba(12,11,9,0.92) 0%, transparent 60%)' : 'linear-gradient(to top, rgba(28,25,23,0.9) 0%, transparent 60%)' }}
                >
                  <h3 className="font-['Cormorant_Garamond'] font-bold text-[1.35rem] text-[#ffffff] mb-2">{svc.title}</h3>
                  <div
                    style={{
                      maxHeight: hov === i ? 80 : 0,
                      opacity: hov === i ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.45s ease, opacity 0.4s ease',
                    }}
                  >
                    <p className="text-[12px] text-[#ffffff]/80 leading-relaxed mb-3">{svc.desc}</p>
                    <span className={`text-[10px] tracking-[0.22em] uppercase font-semibold ${isDark ? 'text-[#D07A55]' : 'text-[#d4b06a]'}`}>View Work →</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── PORTFOLIO (HOME FEATURED) ────────────────────────────────────────────────
function Portfolio({ theme, onNavigate }: { theme: 'dark' | 'light'; onNavigate?: (path: string, el?: HTMLElement | null) => void }) {
  const { projects: cmsProjects, categories: cmsCategories } = useCMS()
  const [cat, setCat] = useState('ALL')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const isDark = theme === 'dark'

  const disabledCategoryNames = useMemo(() => {
    if (!cmsCategories) return new Set<string>()
    return new Set(
      cmsCategories
        .filter((c) => c.is_active === false)
        .map((c) => c.name.trim().toUpperCase())
    )
  }, [cmsCategories])

  const categoryTabs = useMemo(() => {
    if (cmsCategories && cmsCategories.length > 0) {
      const activeCats = cmsCategories.filter((c) => c.is_active !== false)
      return ['ALL', ...activeCats.map((c) => c.name)]
    }
    return ['ALL', 'WEDDINGS', 'PREVIEW ALBUMN', 'BABY SHOWER', 'COUPLES', 'KIDS']
  }, [cmsCategories])

  const activeProjects = useMemo(() => {
    return cmsProjects.filter(
      (p) => p.is_active !== false && !disabledCategoryNames.has(p.category.trim().toUpperCase())
    )
  }, [cmsProjects, disabledCategoryNames])

  const shown = useMemo(() => {
    let list: typeof activeProjects = []
    if (cat.trim().toUpperCase() === 'ALL') {
      const catKeys = categoryTabs.filter((c) => c !== 'ALL')
      const catBuckets: Record<string, typeof activeProjects> = {}

      catKeys.forEach((key) => {
        catBuckets[key] = activeProjects.filter((p) => p.category.trim().toUpperCase() === key.trim().toUpperCase())
      })

      let index = 0
      let added = true

      while (added) {
        added = false
        for (const key of catKeys) {
          if (catBuckets[key] && catBuckets[key][index]) {
            list.push(catBuckets[key][index])
            added = true
          }
        }
        index++
      }
    } else {
      list = activeProjects.filter(
        (p) => p.category.trim().toUpperCase() === cat.trim().toUpperCase()
      )
    }

    return list.slice(0, 12).map((p) => ({
      id: p.id,
      title: p.title,
      cat: p.category,
      img: p.custom_src || p.default_src,
      type: p.type,
      youtube_url: p.youtube_url,
    }))
  }, [activeProjects, cat, categoryTabs])

  const activePhoto = lightboxIndex !== null ? shown[lightboxIndex] : null

  const handleTabSelect = (c: string) => {
    setCat(c)
    setLightboxIndex(null)
  }

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % shown.length))
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + shown.length) % shown.length))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, shown.length])

  return (
    <section className={`py-24 lg:py-36 max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 transition-colors duration-400 ${isDark ? 'bg-[#0c0b09]' : 'bg-white'}`}>
      <Reveal className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b pb-8 border-neutral-200 dark:border-neutral-800">
          <div>
            <div
              className={`inline-flex items-center gap-2.5 text-[11px] tracking-[0.35em] uppercase mb-3 font-semibold ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
                }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'}`} />
              Selected Work
            </div>
            <h2
              className={`font-['DM_Serif_Display'] ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
            >
              Featured Portfolio
            </h2>
            <p className={`text-xs mt-2 font-medium ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>
              Showing 12 highlights from {cat} archive
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {categoryTabs.map((c) => {
              const isActive = cat.trim().toUpperCase() === c.trim().toUpperCase()
              const count = c.trim().toUpperCase() === 'ALL'
                ? activeProjects.length
                : activeProjects.filter((p) => p.category.trim().toUpperCase() === c.trim().toUpperCase()).length

              return (
                <button
                  key={c}
                  onClick={() => handleTabSelect(c)}
                  className={`text-[11px] tracking-[0.2em] uppercase px-4 py-2.5 font-medium transition-all duration-300 rounded-[12px] border flex items-center gap-2 cursor-pointer ${isActive
                    ? isDark
                      ? 'bg-[#D07A55] text-[#0c0b09] border-[#D07A55] shadow-lg shadow-[#D07A55]/20 font-bold scale-[1.02]'
                      : 'bg-[#A85532] text-[#ffffff] border-[#A85532] shadow-md shadow-[#A85532]/20 font-bold scale-[1.02]'
                    : isDark
                      ? 'bg-[#14120e]/80 text-[#f2ece0]/70 border-[#f2ece0]/12 hover:border-[#D07A55]/50 hover:text-[#f2ece0]'
                      : 'bg-neutral-50 text-[#1c1917]/75 border-[#1c1917]/12 hover:border-[#A85532]/50 hover:text-[#1c1917]'
                    }`}
                >
                  <span>{c}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-[12px] ${isActive
                      ? isDark
                        ? 'bg-[#0c0b09]/20 text-[#0c0b09]'
                        : 'bg-white/20 text-white'
                      : isDark
                        ? 'bg-[#f2ece0]/10 text-[#f2ece0]/60'
                        : 'bg-[#1c1917]/08 text-[#1c1917]/60'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}

            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigate) onNavigate('/projects', e.currentTarget)
              }}
              className={`text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 font-bold transition-all duration-300 rounded-[12px] border flex items-center gap-2 cursor-pointer group shadow-sm ${isDark
                ? 'bg-[#D07A55] text-[#0c0b09] border-[#D07A55] hover:bg-[#f2ece0]'
                : 'bg-[#A85532] text-[#ffffff] border-[#A85532] hover:bg-[#1c1917]'
                }`}
            >
              <span>EXPLORE FULL GALLERY ARCHIVE</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </Reveal>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 xl:gap-6 space-y-4 xl:space-y-6">
        {shown.map((item, i) => (
          <Reveal
            key={item.id + i}
            delay={Math.min(i * 30, 300)}
            className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1.5"
          >
            <div className="w-full h-full relative" onClick={() => setLightboxIndex(i)}>
              <img
                src={item.img}
                alt={item.title}
                decoding="async"
                loading="lazy"
                className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />

              {item.type === 'video' && (
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[#A85532]/90 text-white flex items-center justify-center shadow-lg border border-white/30 transform group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-white ml-1" />
                  </div>
                  <span className="mt-2 text-[10px] tracking-[0.2em] font-bold text-white uppercase bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    Watch Video
                  </span>
                </div>
              )}

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                }}
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 text-center">
        <a
          href="/projects"
          onClick={(e) => {
            e.preventDefault()
            if (onNavigate) onNavigate('/projects', e.currentTarget)
          }}
          className={`group inline-flex items-center gap-3 text-[12px] sm:text-[13px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-9 py-4 transition-all duration-350 shadow-lg rounded-[12px] ${isDark
            ? 'bg-[#D07A55] text-[#0c0b09] hover:bg-[#f2ece0]'
            : 'bg-[#A85532] text-[#ffffff] hover:bg-[#1c1917]'
            }`}
        >
          <span>EXPLORE FULL GALLERY ARCHIVE</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </a>
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-6xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white mb-4 px-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D07A55] font-semibold bg-[#D07A55]/15 border border-[#D07A55]/30 px-3 py-1 rounded-[12px]">
                  {activePhoto.cat}
                </span>
                <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-white/90 hidden sm:block">
                  {activePhoto.title}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 font-mono tracking-wider">
                  {lightboxIndex! + 1} / {shown.length}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="text-white/80 hover:text-white text-xs tracking-widest font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-[12px] backdrop-blur-md border border-white/10 transition-all cursor-pointer"
                >
                  ✕ ESC CLOSE
                </button>
              </div>
            </div>

            <div className="relative w-full max-h-[85vh] flex justify-center items-center overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/50">
              {activePhoto.type === 'video' && activePhoto.youtube_url ? (
                <div className="relative w-full aspect-video max-h-[85vh]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(activePhoto.youtube_url)}?autoplay=1&rel=0`}
                    title={activePhoto.title}
                    className="w-full h-full border-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={activePhoto.img}
                  alt={activePhoto.title}
                  className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg select-none"
                />
              )}

              {shown.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex! - 1 + shown.length) % shown.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#D07A55] text-white transition-all backdrop-blur-md border border-white/15 shadow-xl hover:scale-110 cursor-pointer"
                  aria-label="Previous photo"
                >
                  ←
                </button>
              )}

              {shown.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex! + 1) % shown.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#D07A55] text-white transition-all backdrop-blur-md border border-white/15 shadow-xl hover:scale-110 cursor-pointer"
                  aria-label="Next photo"
                >
                  →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── VIDEO SECTION (CINEMATIC FILMS) ──────────────────────────────────────────
function VideoSection({ theme }: { theme: 'dark' | 'light' }) {
  const { cinematicFilms } = useCMS()
  const isDark = theme === 'dark'
  const [playingFilmId, setPlayingFilmId] = useState<string | null>(null)

  const activeFilms = useMemo(() => {
    return cinematicFilms.filter((f) => f.is_active !== false).slice(0, 4)
  }, [cinematicFilms])

  return (
    <section className={`py-24 lg:py-36 transition-colors duration-400 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="text-center mb-14">
          <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-4 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Cinematic Films</p>
          <h2
            className={`font-['Cormorant_Garamond'] font-semibold mb-5 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
            style={{ fontSize: 'clamp(2.2rem, 5vw, 5rem)' }}
          >
            Every Frame Tells a Story.
          </h2>
          <p className={`text-sm max-w-[500px] mx-auto leading-[1.85] ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/70'}`}>
            From emotional wedding films to brand stories and event highlights — cinematic narratives that move people.
          </p>
        </Reveal>

        {/* Dynamic Grid for Up to 4 Cinematic Film Containers */}
        <div className={`grid gap-8 ${
          activeFilms.length === 1
            ? 'grid-cols-1'
            : activeFilms.length === 2
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {activeFilms.map((film, i) => {
            const ytId = extractYouTubeId(film.youtube_url)
            const coverUrl = film.custom_cover_url || film.default_cover_url || '/assets/image/services/Wedding.webp'
            const isPlaying = playingFilmId === film.id

            return (
              <Reveal key={film.id} delay={i * 120}>
                <div
                  className={`relative w-full overflow-hidden group rounded-2xl shadow-2xl border ${
                    isDark ? 'bg-[#1a1814] border-[#f2ece0]/10' : 'bg-white border-[#e7e2d7]'
                  }`}
                  style={{ aspectRatio: '16/9' }}
                >
                  {isPlaying ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                        title={film.title}
                        className="w-full h-full border-0 rounded-2xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                      <button
                        onClick={() => setPlayingFilmId(null)}
                        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-[12px] bg-black/80 hover:bg-black text-white text-xs font-semibold tracking-wider backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                      >
                        ✕ Close Video
                      </button>
                    </div>
                  ) : (
                    <div
                      className="relative w-full h-full cursor-pointer group"
                      onClick={() => setPlayingFilmId(film.id)}
                    >
                      <img
                        src={coverUrl}
                        alt={film.title}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 transition-opacity duration-300 group-hover:opacity-90" />

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div
                          className="flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl backdrop-blur-md cursor-pointer"
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.4)',
                            background: isDark ? 'rgba(208,122,85,0.9)' : 'rgba(168,85,50,0.9)',
                          }}
                        >
                          <div
                            style={{
                              width: 0,
                              height: 0,
                              marginLeft: 6,
                              borderTop: '12px solid transparent',
                              borderBottom: '12px solid transparent',
                              borderLeft: '20px solid #ffffff',
                            }}
                          />
                        </div>
                        <span className="mt-4 text-[11px] font-semibold tracking-[0.25em] uppercase text-white/90 drop-shadow-md">
                          Play Cinematic Film
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5 lg:bottom-8 lg:left-8 lg:right-8 flex items-end justify-between pointer-events-none">
                        <div>
                          <p className="font-['Cormorant_Garamond'] font-bold text-xl lg:text-2xl text-[#ffffff] drop-shadow-md mb-1">
                            {film.title}
                          </p>
                          <p className={`text-[10px] sm:text-[11px] font-['Manrope'] tracking-[0.22em] uppercase font-semibold drop-shadow-sm ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>
                            {film.subtitle || 'Punniyakotti Photography & Film Studio'}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-black/50 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-mono tracking-wider">
                          <span>▶ YouTube HD</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── DRONE SECTION ───────────────────────────────────────────────────────────
function DroneSection({ theme, onNavigate, onNavigateWithFlash }: { theme: 'dark' | 'light'; onNavigate?: (path: string, el?: HTMLElement | null) => void; onNavigateWithFlash?: (path: string, el?: HTMLElement | null) => void }) {
  const { getSectionAsset } = useCMS()
  const isDark = theme === 'dark'
  const doNavigate = onNavigate || onNavigateWithFlash
  const droneBg = getSectionAsset('drone_bg', '/assets/image/puniyakotti (2).webp').src

  return (
    <section className="relative w-full flex items-center overflow-hidden" style={{ minHeight: '85vh' }}>
      <img
        src={droneBg}
        alt="Aerial Cinematography - Wedding Details"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        style={{ filter: isDark ? 'brightness(0.35)' : 'brightness(0.7)' }}
      />
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(140deg, rgba(12,11,9,0.75) 0%, rgba(12,11,9,0.1) 65%)'
            : 'linear-gradient(140deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 65%)',
        }}
      />
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-24 w-full py-32">
        <Reveal className="max-w-2xl">
          <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-7 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Aerial Cinematography</p>
          <h2
            className={`font-['Cormorant_Garamond'] font-semibold leading-[1.0] mb-9 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
            style={{ fontSize: 'clamp(2.8rem, 6vw, 6rem)' }}
          >
            See the Moment<br />from a Different<br />Angle.
          </h2>
          <p className={`text-sm max-w-[400px] leading-[1.85] mb-11 font-medium ${isDark ? 'text-[#f2ece0]/65' : 'text-[#1c1917]/75'}`}>
            Elevate your story with cinematic aerial photography and drone cinematography. Sweeping perspectives for weddings, events, and brand campaigns.
          </p>
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault()
              if (doNavigate) {
                doNavigate('/projects', e.currentTarget)
              }
            }}
            className={`inline-block text-[11px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-9 py-4 border transition-all duration-350 shadow-md rounded-[12px] ${isDark
              ? 'border-[#D07A55] text-[#D07A55] bg-[#0c0b09]/60 hover:bg-[#D07A55] hover:text-[#0c0b09]'
              : 'border-[#A85532] text-[#A85532] bg-[#ffffff]/80 backdrop-blur-md hover:bg-[#A85532] hover:text-[#ffffff]'
              }`}
          >
            Explore Aerial Work
          </a>
        </Reveal>
      </div>
    </section>
  )
}

// ─── WEDDING STORY ───────────────────────────────────────────────────────────
const DEFAULT_WEDDING_IMGS = [
  { id: 'wedding_story_1', defaultSrc: '/assets/image/Wedding Photography/First Look.webp', label: 'First Look' },
  { id: 'wedding_story_2', defaultSrc: '/assets/image/Wedding Photography/Candid Emotion.webp', label: 'Candid Emotion' },
  { id: 'wedding_story_3', defaultSrc: '/assets/image/Wedding Photography/The Ceremony.webp', label: 'The Ceremony' },
  { id: 'wedding_story_4', defaultSrc: '/assets/image/Wedding Photography/Family Moments.webp', label: 'Family Moments' },
  { id: 'wedding_story_5', defaultSrc: '/assets/image/Wedding Photography/Couple Portraits.webp', label: 'Couple Portraits' },
  { id: 'wedding_story_6', defaultSrc: '/assets/image/Wedding Photography/The Celebration.webp', label: 'The Celebration' },
]

function WeddingStory({ theme }: { theme: 'dark' | 'light' }) {
  const { getSectionAsset } = useCMS()
  const isDark = theme === 'dark'

  const activeWeddingImgs = useMemo(() => {
    return DEFAULT_WEDDING_IMGS.map((item, i) => {
      const assetState = getSectionAsset(item.id, item.defaultSrc)
      return {
        ...item,
        assetState,
        width: [280, 220, 200, 260, 240, 210][i % 6],
        aspect: ['3/4', '4/5', '2/3', '3/4', '4/5', '3/4'][i % 6]
      }
    }).filter(item => !item.assetState.isDisabled)
  }, [getSectionAsset])

  const marqueeItems = useMemo(() => {
    return [...activeWeddingImgs, ...activeWeddingImgs]
  }, [activeWeddingImgs])

  return (
    <section className={`py-24 lg:py-36 transition-colors duration-400 overflow-hidden ${isDark ? 'bg-[#0c0b09]' : 'bg-white'}`}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 mb-16">
        <Reveal className="text-center">
          <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-4 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Wedding Photography</p>
          <h2
            className={`font-['Cormorant_Garamond'] font-semibold leading-[1.08] ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
            style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}
          >
            From the First Look<br />to the Last Dance.
          </h2>
        </Reveal>
      </div>

      <Reveal className="relative w-full overflow-hidden">
        {/* Left & Right gradient edge masks for smooth appearance */}
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-16 lg:w-32 z-10 bg-gradient-to-r ${isDark ? 'from-[#0c0b09] to-transparent' : 'from-white to-transparent'}`} />
        <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 lg:w-32 z-10 bg-gradient-to-l ${isDark ? 'from-[#0c0b09] to-transparent' : 'from-white to-transparent'}`} />

        <div className="flex w-max animate-marquee gap-4 lg:gap-6 py-4">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: item.width }}
            >
              <div
                className={`overflow-hidden border rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-xl ${
                  isDark ? 'border-[#f2ece0]/10 bg-[#1a1814]' : 'border-[#e7e2d7] bg-white'
                }`}
                style={{ aspectRatio: item.aspect }}
              >
                <img
                  src={item.assetState.src}
                  alt={item.label}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </div>
              <p className={`text-[10px] tracking-[0.25em] uppercase font-semibold mt-3 transition-colors duration-300 ${
                isDark ? 'text-[#f2ece0]/40 group-hover:text-[#D07A55]' : 'text-[#1c1917]/60 group-hover:text-[#A85532]'
              }`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ─── INSTAGRAM GRID ──────────────────────────────────────────────────────────
const DEFAULT_INSTA = [
  { id: 'insta_1', defaultSrc: '/assets/image/WEDDING/DSC_4811.webp' },
  { id: 'insta_2', defaultSrc: '/assets/image/BABYSHOWER/_DSC1789.webp' },
  { id: 'insta_3', defaultSrc: '/assets/image/COUPLES/RAM_0599.webp' },
  { id: 'insta_4', defaultSrc: '/assets/image/BABYSHOWER/_DSC1834.webp' },
  { id: 'insta_5', defaultSrc: '/assets/image/WEDDING/RAM_0103.webp' },
  { id: 'insta_6', defaultSrc: '/assets/image/BABYSHOWER/_DSC2247.webp' },
  { id: 'insta_7', defaultSrc: '/assets/image/BABY/0B6A9436.webp' },
  { id: 'insta_8', defaultSrc: '/assets/image/BABYSHOWER/0B6A8954 - Copy.webp' },
  { id: 'insta_9', defaultSrc: '/assets/image/BABYSHOWER/_DSC2351.webp' },
]

function InstagramGrid({ theme }: { theme: 'dark' | 'light' }) {
  const { getSectionAsset } = useCMS()
  const isDark = theme === 'dark'

  return (
    <section className={`py-24 lg:py-36 max-w-[1440px] mx-auto px-8 lg:px-16 transition-colors duration-400 ${isDark ? 'bg-[#0c0b09]' : 'bg-white'}`}>
      <Reveal className="text-center mb-12">
        <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-4 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>@spbeventplanner86</p>
        <h2
          className={`font-['Cormorant_Garamond'] font-semibold mb-7 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
          style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
        >
          Follow the Stories.
        </h2>
      </Reveal>

      <div className="grid grid-cols-3 lg:grid-cols-9 gap-1.5 mb-9">
        {DEFAULT_INSTA.map((item, i) => {
          const assetState = getSectionAsset(item.id, item.defaultSrc)
          if (assetState.isDisabled) return null

          return (
            <Reveal
              key={item.id}
              delay={i * 35}
              className={`relative overflow-hidden group cursor-pointer border rounded-xl ${isDark ? 'bg-[#1a1814] border-[#f2ece0]/10' : 'bg-white border-[#e7e2d7]'}`}
              style={{ aspectRatio: '1/1' }}
            >
              <img
                src={assetState.src}
                alt="Studio photography story"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center ${isDark ? 'bg-[#0c0b09]/60' : 'bg-white/75'
                }`}>
                <span className={`text-xl font-bold ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>♡</span>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal className="text-center">
        <a
          href="https://www.instagram.com/spbeventplanner86"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block text-[11px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-9 py-4 border transition-all duration-350 shadow-sm rounded-[12px] ${isDark
            ? 'border-[#f2ece0]/20 text-[#f2ece0]/70 hover:border-[#D07A55] hover:text-[#D07A55]'
            : 'border-[#1c1917]/18 text-[#1c1917]/70 hover:border-[#A85532] hover:text-[#A85532]'
            }`}
        >
          Follow Us on Instagram
        </a>
      </Reveal>
    </section>
  )
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────────
function FinalCTA({ theme }: { theme: 'dark' | 'light' }) {
  const { getSectionAsset } = useCMS()
  const isDark = theme === 'dark'
  const contactBg = getSectionAsset('contact_bg', '/assets/image/COUPLES/RAM_0599.webp').src

  return (
    <section id="contact" className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '85vh' }}>
      <img
        src={contactBg}
        alt="Couple silhouette — Get in Touch"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        style={{ filter: isDark ? 'brightness(0.35)' : 'brightness(0.75)' }}
      />
      <div className={`absolute inset-0 transition-all duration-500 ${isDark ? 'bg-[#0c0b09]/50' : 'bg-white/30'}`} />
      <div className="relative z-10 text-center px-8 py-28">
        <Reveal>
          <p className={`text-[11px] font-['Manrope'] tracking-[0.35em] uppercase font-semibold mb-7 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Get in Touch</p>
          <h2
            className={`font-['Cormorant_Garamond'] font-semibold leading-[1.04] mb-8 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}
            style={{ fontSize: 'clamp(2.6rem, 6vw, 6rem)' }}
          >
            Let's Create Something<br />Worth Remembering.
          </h2>
          <p className={`text-sm max-w-[380px] mx-auto leading-[1.85] mb-12 font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/70'}`}>
            Have an event, wedding, brand story, or celebration coming up? Let's talk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/917708665274?text=Hello!%20I%20would%20like%20to%20check%20availability%20for%20a%20photography%20session."
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[12px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-11 py-4 transition-all duration-350 shadow-md rounded-[12px] ${isDark
                ? 'bg-[#D07A55] text-[#0c0b09] hover:bg-[#f2ece0]'
                : 'bg-[#A85532] text-[#ffffff] hover:bg-[#1c1917]'
                }`}
            >
              Check Availability
            </a>
            <a
              href="https://wa.me/917708665274?text=Hello!%20I%20would%20like%20to%20start%20a%20conversation%20about%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[12px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-11 py-4 border transition-all duration-350 shadow-sm rounded-[12px] ${isDark
                ? 'border-[#f2ece0]/35 text-[#f2ece0] hover:border-[#D07A55] hover:text-[#D07A55]'
                : 'border-[#1c1917]/35 text-[#1c1917] bg-[#ffffff]/60 hover:border-[#A85532] hover:text-[#A85532]'
                }`}
            >
              Start a Conversation
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ theme, onNavigate, onNavigateWithFlash }: { theme: 'dark' | 'light'; onNavigate?: (path: string, el?: HTMLElement | null, hashId?: string) => void; onNavigateWithFlash?: (path: string, el?: HTMLElement | null, hashId?: string) => void }) {
  const isDark = theme === 'dark'
  const doNavigate = onNavigate || onNavigateWithFlash

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault()
    if (path.includes('#')) {
      const hashId = path.split('#')[1]
      const el = document.getElementById(hashId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else if (doNavigate) {
        doNavigate('/', e.currentTarget, hashId)
      }
    } else if (doNavigate) {
      doNavigate(path, e.currentTarget)
    }
  }

  return (
    <footer className={`transition-colors duration-400 ${isDark ? 'bg-[#080706] border-t border-[#f2ece0]/07' : 'bg-white border-t border-[#1c1917]/08'}`}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[2fr_1fr_1fr_1.4fr] gap-12 lg:gap-16 mb-16">
          <div>
            <span className={`font-['Cormorant_Garamond'] font-bold text-2xl tracking-[0.08em] uppercase block mb-5 ${isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'}`}>
              PUNNIYAKOTTI
            </span>
            <p className={`text-[12px] leading-[1.85] max-w-[260px] ${isDark ? 'text-[#f2ece0]/38' : 'text-[#1c1917]/65'}`}>
              A premium photography and videography studio capturing weddings, events, brands, and the moments that define us.
            </p>
          </div>

          <div>
            <p className={`text-[10px] tracking-[0.32em] uppercase font-semibold mb-6 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Navigate</p>
            <div className="flex flex-col gap-3.5">
              {[
                { label: 'Home', path: '/' },
                { label: 'Portfolio', path: '/projects' },
                { label: 'Services', path: '/#services' },
                { label: 'About', path: '/#about' },
                { label: 'Contact', path: '/#contact' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`text-[12px] transition-colors duration-300 tracking-wide font-medium ${isDark ? 'text-[#f2ece0]/48 hover:text-[#f2ece0]' : 'text-[#1c1917]/65 hover:text-[#1c1917]'
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-[10px] tracking-[0.32em] uppercase font-semibold mb-6 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Services</p>
            <div className="flex flex-col gap-3.5">
              {['Wedding Photography', 'Wedding Films', 'Corporate Events', 'Event Videography', 'Drone & Aerial', 'Brand Photography'].map((s) => (
                <a
                  key={s}
                  href="/projects"
                  onClick={(e) => handleLinkClick(e, '/projects')}
                  className={`text-[12px] transition-colors duration-300 tracking-wide font-medium ${isDark ? 'text-[#f2ece0]/48 hover:text-[#f2ece0]' : 'text-[#1c1917]/65 hover:text-[#1c1917]'
                    }`}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-[10px] tracking-[0.32em] uppercase font-semibold mb-6 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>Contact</p>
            <div className="flex flex-col gap-3.5 mb-8">
              <a href="mailto:spbeventplanner86@gmail.com" className={`text-[12px] transition-colors duration-300 font-medium ${isDark ? 'text-[#f2ece0]/48 hover:text-[#f2ece0]' : 'text-[#1c1917]/65 hover:text-[#1c1917]'}`}>
                spbeventplanner86@gmail.com
              </a>
              <a href="https://wa.me/917708665274" target="_blank" rel="noopener noreferrer" className={`text-[12px] transition-colors duration-300 font-medium ${isDark ? 'text-[#f2ece0]/48 hover:text-[#f2ece0]' : 'text-[#1c1917]/65 hover:text-[#1c1917]'}`}>
                +91 7708 665 274
              </a>
              <p className={`text-[12px] font-medium ${isDark ? 'text-[#f2ece0]/38' : 'text-[#1c1917]/50'}`}>Chennai, Tamil Nadu, India</p>
            </div>
            <div className="flex gap-6">
              {[
                { name: 'Instagram', url: 'https://www.instagram.com/spbeventplanner86' },
                { name: 'YouTube', url: 'https://youtube.com' },
                { name: 'WhatsApp', url: 'https://wa.me/917708665274' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[10px] tracking-[0.18em] uppercase transition-colors duration-300 font-semibold ${isDark ? 'text-[#f2ece0]/35 hover:text-[#D07A55]' : 'text-[#1c1917]/60 hover:text-[#A85532]'
                    }`}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-8 border-t ${isDark ? 'border-[#f2ece0]/07' : 'border-[#1c1917]/08'
            }`}
        >
          <p className={`text-[10px] tracking-[0.18em] ${isDark ? 'text-[#f2ece0]/28' : 'text-[#1c1917]/50'}`}>
            © 2026 Punniyakotti Photography. All Rights Reserved.
          </p>
          <p className={`text-[10px] tracking-[0.22em] uppercase font-medium ${isDark ? 'text-[#f2ece0]/18' : 'text-[#1c1917]/40'}`}>
            Photography &amp; Videography Studio — Chennai
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── MAIN APP CONTENT (INSIDE CMS PROVIDER) ─────────────────────────
function MainContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/')
  const [heroMode, setHeroMode] = useState<'image' | 'animation'>('image')
  const [introPhase, setIntroPhase] = useState<IntroPhase>('loading')
  const navLogoRef = useRef<HTMLAnchorElement | null>(null)

  const toggleHeroMode = () => setHeroMode((prev) => (prev === 'image' ? 'animation' : 'image'))

  useEffect(() => {
    document.body.classList.remove('dark-theme')
    localStorage.removeItem('app_theme')
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (toPath: string, _targetEl?: HTMLElement | null, hashId?: string) => {
    window.history.pushState({}, '', toPath + (hashId ? `#${hashId}` : ''))
    setCurrentPath(toPath)
    if (hashId) {
      setTimeout(() => {
        const el = document.getElementById(hashId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
      }, 50)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // ─── ADMIN ROUTE HANDLER ──────────────────────────────────────
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminLayout onNavigateHome={() => handleNavigate('/')}>
        {() => <AdminDashboard />}
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#1c1917]">
      <Preloader
        theme="light"
        onPhaseChange={setIntroPhase}
        navLogoRef={navLogoRef}
      />
      <Nav
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onNavigateWithFlash={handleNavigate}
        heroMode={heroMode}
        onToggleHeroMode={toggleHeroMode}
        introPhase={introPhase}
        navLogoRef={navLogoRef}
      />

      {currentPath === '/projects' ? (
        <ProjectsPage
          onNavigateHome={() => handleNavigate('/')}
          theme="light"
        />
      ) : (
        <>
          <Hero
            onNavigate={handleNavigate}
            onNavigateWithFlash={handleNavigate}
            theme="light"
            heroMode={heroMode}
            introPhase={introPhase}
          />
          <Portfolio theme="light" onNavigate={handleNavigate} />
          <AboutSection theme="light" />
          <Services theme="light" onNavigate={handleNavigate} onNavigateWithFlash={handleNavigate} />
          <VideoSection theme="light" />
          <DroneSection theme="light" onNavigate={handleNavigate} onNavigateWithFlash={handleNavigate} />
          <WeddingStory theme="light" />
          <InstagramGrid theme="light" />
          <FinalCTA theme="light" />
        </>
      )}
      <Footer theme="light" onNavigate={handleNavigate} onNavigateWithFlash={handleNavigate} />
    </div>
  )
}

export default function App() {
  return (
    <CMSProvider>
      <MainContent />
    </CMSProvider>
  )
}
