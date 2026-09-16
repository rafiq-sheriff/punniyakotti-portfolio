import { useState, useEffect } from 'react'

export type IntroPhase =
  | 'loading'
  | 'loader_sliding'
  | 'brand_moving'
  | 'portfolio_reveal'
  | 'hero_image_reveal'
  | 'full_reveal'
  | 'done'

interface PreloaderProps {
  onPhaseChange?: (phase: IntroPhase) => void
  navLogoRef?: React.RefObject<HTMLAnchorElement | null>
  theme?: 'dark' | 'light'
}

export default function Preloader({ onPhaseChange, navLogoRef, theme = 'dark' }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<IntroPhase>('loading')
  const [targetPos, setTargetPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const isDark = theme === 'dark'

  const updatePhase = (newPhase: IntroPhase) => {
    setPhase(newPhase)
    if (onPhaseChange) onPhaseChange(newPhase)
  }

  useEffect(() => {
    // Prevent body scroll during intro sequence
    document.body.style.overflow = 'hidden'

    const startTime = performance.now()
    const duration = 1800 // 1.8s progress duration

    let frameId: number

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const rawRatio = Math.min(elapsed / duration, 1)

      const easedProgress = Math.round((1 - Math.pow(1 - rawRatio, 3)) * 100)
      setProgress(easedProgress)

      if (rawRatio < 1) {
        frameId = requestAnimationFrame(updateProgress)
      } else {
        // Progress 100% reached -> Slide loader page UP
        setTimeout(() => {
          updatePhase('loader_sliding')
        }, 100)
      }
    }

    frameId = requestAnimationFrame(updateProgress)

    return () => {
      cancelAnimationFrame(frameId)
      document.body.style.overflow = ''
    }
  }, [])

  // Measure Nav logo target position as soon as available
  useEffect(() => {
    if (navLogoRef?.current) {
      const rect = navLogoRef.current.getBoundingClientRect()
      setTargetPos({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        width: rect.width,
        height: rect.height,
      })
    }
  }, [navLogoRef])

  // Handle phase progression timings as loader curtain slides UP
  useEffect(() => {
    if (phase === 'loader_sliding') {
      if (navLogoRef?.current) {
        const rect = navLogoRef.current.getBoundingClientRect()
        setTargetPos({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
          width: rect.width,
          height: rect.height,
        })
      }

      // Start brand title movement towards Navbar logo as curtain slides up
      const moveTimer = setTimeout(() => {
        updatePhase('brand_moving')
      }, 100)

      return () => clearTimeout(moveTimer)
    }

    if (phase === 'brand_moving') {
      if (navLogoRef?.current) {
        const rect = navLogoRef.current.getBoundingClientRect()
        setTargetPos({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
          width: rect.width,
          height: rect.height,
        })
      }

      // 800ms for title to land in Navbar position, then trigger portfolio reveal while title stays in place
      const timer = setTimeout(() => {
        updatePhase('portfolio_reveal')
      }, 800)
      return () => clearTimeout(timer)
    }

    if (phase === 'portfolio_reveal') {
      // Reveal background distorted typography PORTFOLIO
      const timer = setTimeout(() => {
        updatePhase('hero_image_reveal')
      }, 350)
      return () => clearTimeout(timer)
    }

    if (phase === 'hero_image_reveal') {
      // Reveal hero background image
      const timer = setTimeout(() => {
        updatePhase('full_reveal')
      }, 350)
      return () => clearTimeout(timer)
    }

    if (phase === 'full_reveal') {
      // Restore body scroll after full layout reveals
      const timer = setTimeout(() => {
        document.body.style.overflow = ''
        updatePhase('done')
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [phase, navLogoRef])

  if (phase === 'done') return null

  const isSlidingUp = phase !== 'loading'
  const isMoving = phase === 'brand_moving'
  const isReached = phase === 'portfolio_reveal' || phase === 'hero_image_reveal' || phase === 'full_reveal'

  // Center screen fallback position
  const startTop = typeof window !== 'undefined' ? window.innerHeight / 2 : 300
  const startLeft = typeof window !== 'undefined' ? window.innerWidth / 2 : 400

  const currentTop = (isMoving || isReached) && targetPos ? targetPos.top : startTop
  const currentLeft = (isMoving || isReached) && targetPos ? targetPos.left : startLeft
  const fontSize = (isMoving || isReached) ? 'clamp(24px, 2.5vw, 30px)' : 'clamp(32px, 5.5vw, 60px)'
  const letterSpacing = (isMoving || isReached) ? '0.08em' : '0.24em'
  // Title remains 100% visible permanently once docked into Navbar position
  const titleOpacity = 1

  return (
    <>
      {/* 1. SLIDING PRELOADER OVERLAY (SLIDES UP SIDE ON 100%) */}
      <div
        className="fixed inset-0 z-[999990] flex flex-col items-center justify-between select-none pointer-events-auto overflow-hidden"
        style={{
          transform: isSlidingUp ? 'translateY(-100%)' : 'translateY(0%)',
          transition: 'transform 0.85s cubic-bezier(0.77, 0, 0.175, 1)',
          backgroundColor: isDark ? '#0c0b09' : '#faf8f5',
          color: isDark ? '#f2ece0' : '#1c1917',
        }}
      >
        {/* Top Bar Branding */}
        <div className="w-full max-w-[1440px] px-8 pt-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D07A55] animate-ping" />
            <span className="text-[11px] font-['Manrope'] tracking-[0.3em] uppercase font-semibold text-[#D07A55]">
              BEHIND THE LENS
            </span>
          </div>
          <span className="text-[11px] font-['Manrope'] tracking-[0.25em] uppercase opacity-40 font-medium">
            STUDIO ARCHIVE 2026
          </span>
        </div>

        {/* Center Cinematic Camera Lens Graphic Assembly (Positioned cleanly ABOVE PUNNIYAKOTTI) */}
        <div className="flex flex-col items-center justify-center my-auto relative px-6 text-center z-10">
          {/* Realistic Camera Lens Graphic Assembly */}
          <div
            className="relative w-32 h-32 sm:w-40 sm:h-40 mb-20 sm:mb-24 flex items-center justify-center transition-all duration-850 ease-out"
            style={{
              transform: isSlidingUp ? 'translateY(-100px) scale(0.9)' : 'translateY(0) scale(1)',
              opacity: isSlidingUp ? 0.2 : 1,
            }}
          >
            {/* 1. Outer Metallic Knurled Grip Ring (Rotating) */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed opacity-40 transition-transform duration-100"
              style={{
                borderColor: isDark ? '#D07A55' : '#A85532',
                transform: `rotate(${progress * 2.4}deg)`,
              }}
            />

            {/* 2. Outer Lens Barrel with Lens Markings */}
            <div
              className={`absolute inset-1.5 rounded-full border shadow-2xl flex items-center justify-center ${
                isDark ? 'border-[#f2ece0]/15 bg-[#12100d]' : 'border-[#1c1917]/15 bg-[#f0eee9]'
              }`}
            >
              {/* Focal Markings Text Path SVG */}
              <svg
                className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]"
                viewBox="0 0 160 160"
              >
                <path
                  id="lensTextPath"
                  d="M 80,80 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0"
                  fill="none"
                />
                <text fontSize="7" fontWeight="600" letterSpacing="2.5" fill={isDark ? 'rgba(242,236,224,0.5)' : 'rgba(28,25,23,0.5)'}>
                  <textPath href="#lensTextPath" startOffset="0%">
                    PUNNIYAKOTTI OPTICS · 50mm F/1.2 CINEMA LENS · Ø 82mm ·
                  </textPath>
                </text>
              </svg>

              {/* 3. Inner Focus Distance Ring */}
              <div
                className={`absolute inset-6 rounded-full border border-dashed opacity-50 ${
                  isDark ? 'border-[#D07A55]/40' : 'border-[#A85532]/40'
                }`}
                style={{
                  transform: `rotate(-${progress * 3.6}deg)`,
                  transition: 'transform 0.1s linear',
                }}
              />

              {/* 4. Optical Multi-Coated Front Lens Glass & Flare */}
              <div
                className="absolute inset-8 rounded-full shadow-inner overflow-hidden flex items-center justify-center"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle at 35% 35%, rgba(208,122,85,0.3) 0%, rgba(12,11,9,0.95) 75%)'
                    : 'radial-gradient(circle at 35% 35%, rgba(168,85,50,0.2) 0%, rgba(250,248,245,0.95) 75%)',
                  border: isDark ? '1px solid rgba(242,236,224,0.1)' : '1px solid rgba(28,25,23,0.1)',
                }}
              >
                {/* Anti-reflective Glass Reflex Flare Streak */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 45%, rgba(208,122,85,0.25) 100%)',
                  }}
                />

                {/* 5. Mechanical Aperture Blades Diaphragm */}
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-300"
                  style={{
                    transform: `rotate(${progress * 1.8}deg)`,
                    color: isDark ? '#D07A55' : '#A85532',
                  }}
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                  <path d="M50 8 L68 50 L50 42 Z" fill="currentColor" opacity="0.75" />
                  <path d="M92 50 L50 68 L58 50 Z" fill="currentColor" opacity="0.8" />
                  <path d="M50 92 L32 50 L50 58 Z" fill="currentColor" opacity="0.75" />
                  <path d="M8 50 L50 32 L42 50 Z" fill="currentColor" opacity="0.8" />
                  <path d="M79.7 20.3 L50 50 L64.1 35.9 Z" fill="currentColor" opacity="0.7" />
                  <path d="M79.7 79.7 L50 50 L64.1 64.1 Z" fill="currentColor" opacity="0.7" />
                  <path d="M20.3 79.7 L50 50 L35.9 64.1 Z" fill="currentColor" opacity="0.7" />
                  <path d="M20.3 20.3 L50 50 L35.9 35.9 Z" fill="currentColor" opacity="0.7" />
                  <circle
                    cx="50"
                    cy="50"
                    r={Math.max(6, 26 - (progress / 100) * 16)}
                    fill={isDark ? '#0c0b09' : '#faf8f5'}
                    stroke="currentColor"
                    strokeWidth="1"
                    style={{ transition: 'r 0.15s ease-out' }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Empty Spacer reserved for floating title */}
          <div className="h-10 sm:h-12 mb-3" />

          <p className="text-[11px] sm:text-[12px] font-['Manrope'] tracking-[0.35em] uppercase font-medium opacity-60">
            PHOTOGRAPHY &amp; CINEMATOGRAPHY
          </p>
        </div>

        {/* Bottom Progress Counter & Slim Loader Line */}
        <div className="w-full max-w-[1440px] px-8 pb-10 flex flex-col items-center gap-4 z-10">
          <div className="w-full flex items-center justify-between text-xs font-['Manrope'] tracking-[0.2em]">
            <span className="opacity-50 text-[11px] uppercase">Loading Visual Experience...</span>
            <span className="font-bold text-[#D07A55] text-sm font-mono">{progress}%</span>
          </div>

          <div
            className="w-full h-[2px] rounded-full overflow-hidden relative"
            style={{ backgroundColor: isDark ? 'rgba(242,236,224,0.1)' : 'rgba(28,25,23,0.1)' }}
          >
            <div
              className="h-full transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: isDark ? '#D07A55' : '#A85532',
                boxShadow: isDark ? '0 0 12px #D07A55' : '0 0 8px #A85532',
              }}
            />
          </div>
        </div>

        {/* Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle, ${isDark ? '#D07A55' : '#A85532'} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* 2. FLOATING BRAND TITLE "PUNNIYAKOTTI"
          Animates from screen center to the exact top-left Navbar logo position and remains docked there permanently */}
      <div
        className="fixed z-[999999] pointer-events-none whitespace-nowrap flex items-center justify-center"
        style={{
          top: `${currentTop}px`,
          left: `${currentLeft}px`,
          transform: 'translate(-50%, -50%)',
          opacity: titleOpacity,
          transition: phase === 'brand_moving'
            ? 'top 0.8s cubic-bezier(0.16, 1, 0.3, 1), left 0.8s cubic-bezier(0.16, 1, 0.3, 1), font-size 0.8s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'none',
        }}
      >
        <h1
          className={`font-['Cormorant_Garamond'] font-bold uppercase leading-none ${
            isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'
          }`}
          style={{
            fontSize,
            letterSpacing,
            transition: phase === 'brand_moving'
              ? 'font-size 0.8s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
          }}
        >
          PUNNIYAKOTTI
        </h1>
      </div>
    </>
  )
}



