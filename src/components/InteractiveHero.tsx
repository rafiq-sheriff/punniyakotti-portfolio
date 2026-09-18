import { useState, useEffect, useRef } from 'react'
import DistortedTypography from './DistortedTypography'

interface SpriteSheetConfig {
  src: string
  totalFrames: number
  cols: number
  rows: number
  frameWidth: number
  frameHeight: number
  isHorizontal: boolean
}

// Default configuration using 120-frame 30fps Ultra HD WebP grid (960x540 per frame)
const CONFIG_24FPS_GRID: SpriteSheetConfig = {
  src: '/hero-sprites/hero_spritesheet_24fps_grid.webp',
  totalFrames: 120,
  cols: 12,
  rows: 10,
  frameWidth: 960,
  frameHeight: 540,
  isHorizontal: false,
}

// Fallback configuration for horizontal sprite sheet
const CONFIG_HORIZONTAL: SpriteSheetConfig = {
  src: '/hero-sprites/hero_spritesheet_horizontal.webp',
  totalFrames: 48,
  cols: 48,
  rows: 1,
  frameWidth: 320,
  frameHeight: 180,
  isHorizontal: true,
}

interface InteractiveHeroProps {
  onNavigate?: (path: string, targetEl?: HTMLElement | null) => void
  onNavigateWithFlash?: (path: string, targetEl?: HTMLElement | null) => void
  theme?: 'dark' | 'light'
}

export default function InteractiveHero({ onNavigate, onNavigateWithFlash, theme = 'light' }: InteractiveHeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const isDark = theme === 'dark'
  
  // Animation state stored in refs to avoid re-renders on every frame tick
  const stateRef = useRef({
    targetFrame: 60, // Start in middle idle pose
    currentFrame: 60,
    activeConfig: CONFIG_24FPS_GRID,
    img: null as HTMLImageElement | null,
    animating: true,
  })

  // Cache bounds to avoid layout thrashing during mousemove and 60fps render loop
  const cachedBoundsRef = useRef({ left: 0, width: 0, height: 0 })

  const updateCachedBounds = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      cachedBoundsRef.current = { left: rect.left, width: rect.width, height: rect.height }
    }
  }

  // State and ref for viewport visibility & active rendering loop
  const isInViewRef = useRef(true)
  const isLoopRunningRef = useRef(false)
  const animationFrameIdRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    const img = new Image()
    img.src = CONFIG_24FPS_GRID.src

    img.onload = () => {
      if (!mounted) return
      stateRef.current.img = img
      stateRef.current.activeConfig = CONFIG_24FPS_GRID
      setLoaded(true)
      updateCachedBounds()
      requestRender()
    }

    img.onerror = () => {
      console.warn('Grid sprite sheet load failed, falling back to horizontal strip...')
      const fallbackImg = new Image()
      fallbackImg.src = CONFIG_HORIZONTAL.src
      fallbackImg.onload = () => {
        if (!mounted) return
        stateRef.current.img = fallbackImg
        stateRef.current.activeConfig = CONFIG_HORIZONTAL
        stateRef.current.targetFrame = 24
        stateRef.current.currentFrame = 24
        setLoaded(true)
        updateCachedBounds()
        requestRender()
      }
    }

    return () => {
      mounted = false
    }
  }, [])

  // ResizeObserver & window resize listener for cached bounds
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    updateCachedBounds()

    const resizeObserver = new ResizeObserver(() => {
      updateCachedBounds()
    })
    resizeObserver.observe(el)

    const handleResize = () => updateCachedBounds()
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('scroll', handleResize, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  }, [])

  // Smart render function: renders frames while interpolating, pauses when idle or off-screen
  const requestRender = () => {
    if (!isInViewRef.current || isLoopRunningRef.current) return
    isLoopRunningRef.current = true

    const renderStep = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      const { img, activeConfig } = stateRef.current

      if (!isInViewRef.current) {
        isLoopRunningRef.current = false
        animationFrameIdRef.current = null
        return
      }

      let needsNextFrame = false

      if (canvas && container && img) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          let width = cachedBoundsRef.current.width
          let height = cachedBoundsRef.current.height

          if (width === 0 || height === 0) {
            updateCachedBounds()
            width = cachedBoundsRef.current.width
            height = cachedBoundsRef.current.height
          }

          if (width > 0 && height > 0) {
            const displayWidth = Math.floor(width * dpr)
            const displayHeight = Math.floor(height * dpr)

            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
              canvas.width = displayWidth
              canvas.height = displayHeight
            }

            // Smooth interpolation towards target frame
            const diff = stateRef.current.targetFrame - stateRef.current.currentFrame
            if (Math.abs(diff) > 0.001) {
              stateRef.current.currentFrame += diff * 0.085
              needsNextFrame = true
            } else {
              stateRef.current.currentFrame = stateRef.current.targetFrame
            }

            const frameIndex = Math.min(
              Math.max(Math.round(stateRef.current.currentFrame), 0),
              activeConfig.totalFrames - 1
            )

            let sx = 0
            let sy = 0

            if (activeConfig.isHorizontal) {
              sx = frameIndex * activeConfig.frameWidth
              sy = 0
            } else {
              const col = frameIndex % activeConfig.cols
              const row = Math.floor(frameIndex / activeConfig.cols)
              sx = col * activeConfig.frameWidth
              sy = row * activeConfig.frameHeight
            }

            const frameAspect = activeConfig.frameWidth / activeConfig.frameHeight
            const canvasAspect = width / height

            let drawWidth = width
            let drawHeight = height
            let dx = 0
            let dy = 0

            if (canvasAspect > frameAspect) {
              drawHeight = width / frameAspect
              dy = (height - drawHeight) / 2
            } else {
              drawWidth = height * frameAspect
              dx = (width - drawWidth) / 2
            }

            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            ctx.save()
            ctx.scale(dpr, dpr)
            ctx.clearRect(0, 0, width, height)

            ctx.drawImage(
              img,
              sx,
              sy,
              activeConfig.frameWidth,
              activeConfig.frameHeight,
              dx,
              dy,
              drawWidth,
              drawHeight
            )
            ctx.restore()
          }
        }
      }

      if (needsNextFrame && isInViewRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(renderStep)
      } else {
        isLoopRunningRef.current = false
        animationFrameIdRef.current = null
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderStep)
  }

  // IntersectionObserver to pause loop when Hero is scrolled out of view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          updateCachedBounds()
          requestRender()
        } else {
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current)
            animationFrameIdRef.current = null
          }
          isLoopRunningRef.current = false
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [])

  // Pointer Movement Handlers
  const handlePointerMove = (clientX: number) => {
    const { left, width } = cachedBoundsRef.current
    if (width <= 0) return

    const ratio = Math.max(0, Math.min(1, (clientX - left) / width))

    const { activeConfig } = stateRef.current
    const newTarget = Math.round((1 - ratio) * (activeConfig.totalFrames - 1))

    stateRef.current.targetFrame = newTarget
    setIsHovering(true)
    requestRender()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX)
    }
  }

  const handleMouseLeave = () => {
    const { activeConfig } = stateRef.current
    const idlePose = Math.floor(activeConfig.totalFrames / 2)
    stateRef.current.targetFrame = idlePose
    setIsHovering(false)
    requestRender()
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden select-none transition-colors duration-400 ${
        isDark ? 'bg-[#0c0b09]' : 'bg-[#fbf9f5]'
      }`}
      style={{ height: '100svh', minHeight: 680 }}
    >
      {/* Background Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: loaded ? 1 : 0 }}
      />

      {/* Centered Interactive WebGL Distorted PORTFOLIO Typography */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-auto select-none overflow-hidden px-2">
        <DistortedTypography theme={theme} text="PORTFOLIO" />
      </div>

      {/* Fallback loader state while sprite sheet decodes */}
      {!loaded && (
        <div
          className={`absolute inset-0 z-[3] flex flex-col items-center justify-center gap-4 ${
            isDark ? 'bg-[#0c0b09] text-[#f2ece0]/60' : 'bg-[#fbf9f5] text-[#1c1917]/60'
          }`}
        >
          <div
            className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
              isDark ? 'border-[#D07A55]' : 'border-[#A85532]'
            }`}
          />
          <span className="text-[11px] tracking-[0.25em] uppercase">Preparing Hero Interactive...</span>
        </div>
      )}

      {/* 4-Corner Layout Overlay (Center completely clear for photographer subject) */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 sm:px-12 lg:px-16 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col justify-between pointer-events-none">
        
        {/* TOP ROW */}
        <div className="flex items-start justify-between w-full gap-2">
          {/* TOP LEFT (Left Side Up): Studio Tag */}
          <div
            className={`pointer-events-auto inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[12px] backdrop-blur-md shadow-lg ${
              isDark
                ? 'border border-[#D07A55]/35 bg-[#0c0b09]/65'
                : 'border border-[#A85532]/35 bg-[#ffffff]/85'
            }`}
            style={{ animation: 'fadeUp 0.85s ease 0.2s both' }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'
                }`}
              />
            </span>
            <span
              className={`text-[11px] sm:text-[13px] font-['Manrope'] font-medium tracking-[0.16em] sm:tracking-[0.22em] uppercase whitespace-nowrap ${
                isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
              }`}
            >
              BEHIND THE LENS
            </span>
          </div>

          {/* TOP RIGHT (Right Side Up): People · Emotion · Moments */}
          <div
            className={`pointer-events-auto inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-[12px] backdrop-blur-md shadow-lg ${
              isDark
                ? 'border border-[#f2ece0]/20 bg-[#0c0b09]/65 text-[#f2ece0]/90'
                : 'border border-[#1c1917]/15 bg-[#ffffff]/85 text-[#1c1917]'
            }`}
            style={{ animation: 'fadeUp 0.85s ease 0.3s both' }}
          >
            <span className="text-[11px] sm:text-[13px] font-['Manrope'] font-medium tracking-[0.16em] sm:tracking-[0.22em] uppercase whitespace-nowrap">
              People <span className={isDark ? 'text-[#D07A55] mx-0.5 sm:mx-1' : 'text-[#A85532] mx-0.5 sm:mx-1'}>·</span> Emotion <span className={isDark ? 'text-[#D07A55] mx-0.5 sm:mx-1' : 'text-[#A85532] mx-1'}>·</span> Moments
            </span>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-6 sm:gap-8">
          {/* BOTTOM LEFT (Left Side Down): Headline */}
          <div className="pointer-events-auto max-w-xl">
            <h1
              className="leading-[0.95] drop-shadow-md"
              style={{
                animation: 'fadeUp 0.9s ease 0.4s both',
              }}
            >
              <span
                className={`font-['Cormorant_Garamond'] font-semibold block ${
                  isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'
                }`}
                style={{ fontSize: 'clamp(44px, 5.5vw, 88px)' }}
              >
                I Capture
              </span>
              <span
                className={`font-['Cormorant_Garamond'] font-bold italic block ${
                  isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
                }`}
                style={{ fontSize: 'clamp(44px, 5.5vw, 88px)' }}
              >
                What Words Can't.
              </span>
            </h1>
          </div>

          {/* BOTTOM RIGHT (Right Side Down): CTA Buttons */}
          <div
            className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 sm:justify-end"
            style={{ animation: 'fadeUp 0.9s ease 0.7s both' }}
          >
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault()
                const navFn = onNavigate || onNavigateWithFlash
                if (navFn) {
                  navFn('/projects', e.currentTarget)
                }
              }}
              className={`group inline-flex items-center justify-center gap-3 text-[12px] sm:text-[13px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-6 sm:px-8 py-3.5 sm:py-4 transition-all duration-350 shadow-xl rounded-[12px] ${
                isDark
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
              className={`inline-flex items-center justify-center text-[12px] sm:text-[13px] font-['Manrope'] font-bold tracking-[0.18em] uppercase px-6 sm:px-8 py-3.5 sm:py-4 border transition-all duration-350 backdrop-blur-sm shadow-md rounded-[12px] ${
                isDark
                  ? 'border-[#f2ece0]/30 text-[#f2ece0] hover:border-[#D07A55] hover:text-[#D07A55]'
                  : 'border-[#1c1917]/25 bg-[#ffffff]/60 text-[#1c1917] hover:border-[#A85532] hover:text-[#A85532]'
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
