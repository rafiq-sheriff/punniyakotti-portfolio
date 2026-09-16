import InteractiveHero from './InteractiveHero'

interface HeroAnimationProps {
  onNavigate?: (path: string, targetEl?: HTMLElement | null) => void
  onNavigateWithFlash?: (path: string, targetEl?: HTMLElement | null) => void
  theme?: 'dark' | 'light'
}

/**
 * HeroAnimation component — wraps the interactive 360 canvas head-turn sprite animation
 * for reusable inclusion anywhere in the portfolio.
 */
export default function HeroAnimation({ onNavigate, onNavigateWithFlash, theme = 'light' }: HeroAnimationProps) {
  return <InteractiveHero onNavigate={onNavigate || onNavigateWithFlash} theme={theme} />
}
