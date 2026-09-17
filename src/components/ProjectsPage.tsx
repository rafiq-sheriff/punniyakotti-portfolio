import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCMS } from '../context/CMSContext'
import { extractYouTubeId } from '../lib/supabase'

export interface GalleryItem {
  id: string
  src: string
  category: string
  title: string
  type?: 'image' | 'video'
  youtube_url?: string | null
}

// Default hardcoded 89 photography images as default fallbacks
export const DEFAULT_GALLERY_DATA: GalleryItem[] = [
  // WEDDINGS
  { id: 'w-1', src: '/assets/comperessed images/WEDDING/DSC_4729.webp', category: 'WEDDINGS', title: 'Royal Heritage Wedding' },
  { id: 'w-2', src: '/assets/comperessed images/WEDDING/DSC_4806.webp', category: 'WEDDINGS', title: 'Sacred Vows & Rituals' },
  { id: 'w-3', src: '/assets/comperessed images/WEDDING/DSC_4811.webp', category: 'WEDDINGS', title: 'Bridal Elegance' },
  { id: 'w-4', src: '/assets/comperessed images/WEDDING/DSC_4818.webp', category: 'WEDDINGS', title: 'Ceremonial Moments' },
  { id: 'w-5', src: '/assets/comperessed images/WEDDING/DSC_4835.webp', category: 'WEDDINGS', title: 'Joyful Celebrations' },
  { id: 'w-6', src: '/assets/comperessed images/WEDDING/DSC_4844.webp', category: 'WEDDINGS', title: 'Traditional Union' },
  { id: 'w-7', src: '/assets/comperessed images/WEDDING/DSC_4858.webp', category: 'WEDDINGS', title: 'Ethereal Bridal Frame' },
  { id: 'w-8', src: '/assets/comperessed images/WEDDING/DSC_4869.webp', category: 'WEDDINGS', title: 'Candid Couple Smiles' },
  { id: 'w-9', src: '/assets/comperessed images/WEDDING/DSC_4873.webp', category: 'WEDDINGS', title: 'Blessings & Rituals' },
  { id: 'w-10', src: '/assets/comperessed images/WEDDING/RAM_0100.webp', category: 'WEDDINGS', title: 'Grand Heritage Celebration' },
  { id: 'w-11', src: '/assets/comperessed images/WEDDING/RAM_0103.webp', category: 'WEDDINGS', title: 'Sunset Couple Portrait' },
  { id: 'w-12', src: '/assets/comperessed images/WEDDING/12 345680.webp', category: 'WEDDINGS', title: 'Timeless Wedding Story' },
  { id: 'w-13', src: '/assets/comperessed images/WEDDING/CRT02 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 01' },
  { id: 'w-14', src: '/assets/comperessed images/WEDDING/CRT03 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 02' },
  { id: 'w-15', src: '/assets/comperessed images/WEDDING/CRT03 2.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 03' },
  { id: 'w-16', src: '/assets/comperessed images/WEDDING/CRT12 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 04' },

  // PREVIEW ALBUMN
  { id: 'pa-1', src: '/assets/comperessed images/PREVIEW ALBUMN/01.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 01' },
  { id: 'pa-2', src: '/assets/comperessed images/PREVIEW ALBUMN/04.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 04' },
  { id: 'pa-3', src: '/assets/comperessed images/PREVIEW ALBUMN/06.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 06' },
  { id: 'pa-4', src: '/assets/comperessed images/PREVIEW ALBUMN/10.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 10' },
  { id: 'pa-5', src: '/assets/comperessed images/PREVIEW ALBUMN/14.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 14' },
  { id: 'pa-6', src: '/assets/comperessed images/PREVIEW ALBUMN/15.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 15' },
  { id: 'pa-7', src: '/assets/comperessed images/PREVIEW ALBUMN/18.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 18' },
  { id: 'pa-8', src: '/assets/comperessed images/PREVIEW ALBUMN/CRT08.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 08' },
  { id: 'pa-9', src: '/assets/comperessed images/PREVIEW ALBUMN/CRT10.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 10' },
  { id: 'pa-10', src: '/assets/comperessed images/PREVIEW ALBUMN/CRT12.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 12' },
  { id: 'pa-11', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0018.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 18' },
  { id: 'pa-12', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0019.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 19' },
  { id: 'pa-13', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0020.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 20' },
  { id: 'pa-14', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0021.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 21' },
  { id: 'pa-15', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0022.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 22' },
  { id: 'pa-16', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0028.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 28' },
  { id: 'pa-17', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0031.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 31' },
  { id: 'pa-18', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0009.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 09' },
  { id: 'pa-19', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0014.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 14' },
  { id: 'pa-20', src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0016.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 16' },
  { id: 'pa-21', src: '/assets/comperessed images/PREVIEW ALBUMN/SAVE_20250610_192917.webp', category: 'PREVIEW ALBUMN', title: 'Archival Print Spread 17' },
  { id: 'pa-22', src: '/assets/comperessed images/PREVIEW ALBUMN/SAVE_20250610_192925.webp', category: 'PREVIEW ALBUMN', title: 'Archival Print Spread 25' },

  // BABYSHOWER
  { id: 'bs-1', src: '/assets/comperessed images/BABYSHOWER/_DSC1749.webp', category: 'BABY SHOWER', title: 'Traditional Seemantham' },
  { id: 'bs-2', src: '/assets/comperessed images/BABYSHOWER/_DSC1765.webp', category: 'BABY SHOWER', title: 'Blessings Ceremony' },
  { id: 'bs-3', src: '/assets/comperessed images/BABYSHOWER/_DSC1775.webp', category: 'BABY SHOWER', title: 'Floral Offerings' },
  { id: 'bs-4', src: '/assets/comperessed images/BABYSHOWER/_DSC1789.webp', category: 'BABY SHOWER', title: 'Family Happiness' },
  { id: 'bs-5', src: '/assets/comperessed images/BABYSHOWER/_DSC1790.webp', category: 'BABY SHOWER', title: 'Warm Wishes' },
  { id: 'bs-6', src: '/assets/comperessed images/BABYSHOWER/_DSC1817.webp', category: 'BABY SHOWER', title: 'Sacred Ritual' },
  { id: 'bs-7', src: '/assets/comperessed images/BABYSHOWER/_DSC1829.webp', category: 'BABY SHOWER', title: 'Motherhood Glow' },
  { id: 'bs-8', src: '/assets/comperessed images/BABYSHOWER/_DSC1834.webp', category: 'BABY SHOWER', title: 'Seemantham Celebration' },
  { id: 'bs-9', src: '/assets/comperessed images/BABYSHOWER/_DSC1836.webp', category: 'BABY SHOWER', title: 'Joyful Moments' },
  { id: 'bs-10', src: '/assets/comperessed images/BABYSHOWER/_DSC1895.webp', category: 'BABY SHOWER', title: 'Cherished Memories' },
  { id: 'bs-11', src: '/assets/comperessed images/BABYSHOWER/_DSC1949.webp', category: 'BABY SHOWER', title: 'Family Gathering' },
  { id: 'bs-12', src: '/assets/comperessed images/BABYSHOWER/_DSC2247.webp', category: 'BABY SHOWER', title: 'Golden Blessing' },
  { id: 'bs-13', src: '/assets/comperessed images/BABYSHOWER/_DSC2351.webp', category: 'BABY SHOWER', title: 'Radiant Smile' },
  { id: 'bs-14', src: '/assets/comperessed images/BABYSHOWER/0B6A8829 - Copy.webp', category: 'BABY SHOWER', title: 'Expectant Couple' },
  { id: 'bs-15', src: '/assets/comperessed images/BABYSHOWER/0B6A8839 - Copy.webp', category: 'BABY SHOWER', title: 'Ceremonial Bangle Ritual' },
  { id: 'bs-16', src: '/assets/comperessed images/BABYSHOWER/0B6A8860 - Copy.webp', category: 'BABY SHOWER', title: 'Festive Decoration' },
  { id: 'bs-17', src: '/assets/comperessed images/BABYSHOWER/0B6A8930 - Copy.webp', category: 'BABY SHOWER', title: 'Happy Family' },
  { id: 'bs-18', src: '/assets/comperessed images/BABYSHOWER/0B6A8937 - Copy.webp', category: 'BABY SHOWER', title: 'Warm Smiles' },
  { id: 'bs-19', src: '/assets/comperessed images/BABYSHOWER/0B6A8943 - Copy.webp', category: 'BABY SHOWER', title: 'Blessings Portrait' },
  { id: 'bs-20', src: '/assets/comperessed images/BABYSHOWER/0B6A8954 - Copy.webp', category: 'BABY SHOWER', title: 'Family Tradition' },
  { id: 'bs-21', src: '/assets/comperessed images/BABYSHOWER/0B6A8972 - Copy.webp', category: 'BABY SHOWER', title: 'Floral Decor' },
  { id: 'bs-22', src: '/assets/comperessed images/BABYSHOWER/0B6A8986 - Copy.webp', category: 'BABY SHOWER', title: 'Celebration Frame' },
  { id: 'bs-23', src: '/assets/comperessed images/BABYSHOWER/0B6A9078 - Copy.webp', category: 'BABY SHOWER', title: 'Happy Moments' },
  { id: 'bs-24', src: '/assets/comperessed images/BABYSHOWER/0B6A9195 - Copy.webp', category: 'BABY SHOWER', title: 'Grandparents Blessing' },
  { id: 'bs-25', src: '/assets/comperessed images/BABYSHOWER/0B6A9217 - Copy.webp', category: 'BABY SHOWER', title: 'Sweet Laughter' },
  { id: 'bs-26', src: '/assets/comperessed images/BABYSHOWER/0B6A9390.webp', category: 'BABY SHOWER', title: 'Traditional Elegance' },
  { id: 'bs-27', src: '/assets/comperessed images/BABYSHOWER/0B6A9527.webp', category: 'BABY SHOWER', title: 'Precious Memories' },
  { id: 'bs-28', src: '/assets/comperessed images/BABYSHOWER/1B9A4827.webp', category: 'BABY SHOWER', title: 'Family Heirloom' },

  // COUPLES
  { id: 'c-1', src: '/assets/comperessed images/COUPLES/RAM_0599.webp', category: 'COUPLES', title: 'Sunset Coastal Romance' },
  { id: 'c-2', src: '/assets/comperessed images/COUPLES/5I2A0403.webp', category: 'COUPLES', title: 'Golden Hour Embrace' },
  { id: 'c-3', src: '/assets/comperessed images/COUPLES/0B6A0809.webp', category: 'COUPLES', title: 'Intimate Connection' },
  { id: 'c-4', src: '/assets/comperessed images/COUPLES/0B6A0822.webp', category: 'COUPLES', title: 'Candid Laughter' },
  { id: 'c-5', src: '/assets/comperessed images/COUPLES/0B6A0829.webp', category: 'COUPLES', title: 'Romantic Walk' },
  { id: 'c-6', src: '/assets/comperessed images/COUPLES/0B6A0831.webp', category: 'COUPLES', title: 'Pre-Wedding Magic' },
  { id: 'c-7', src: '/assets/comperessed images/COUPLES/0B6A0923.webp', category: 'COUPLES', title: 'Love & Warmth' },
  { id: 'c-8', src: '/assets/comperessed images/COUPLES/0B6A0961.webp', category: 'COUPLES', title: 'Heritage Backdrop' },
  { id: 'c-9', src: '/assets/comperessed images/COUPLES/0B6A0975.webp', category: 'COUPLES', title: 'Golden Light Portrait' },
  { id: 'c-10', src: '/assets/comperessed images/COUPLES/0B6A0986.webp', category: 'COUPLES', title: 'Timeless Together' },

  // KIDS
  { id: 'k-1', src: '/assets/comperessed images/BABY/03.webp', category: 'KIDS', title: 'Pure Joy & Innocence' },
  { id: 'k-2', src: '/assets/comperessed images/BABY/0B6A8894 - Copy.webp', category: 'KIDS', title: 'Playful Milestones' },
  { id: 'k-3', src: '/assets/comperessed images/BABY/0B6A8912 - Copy.webp', category: 'KIDS', title: 'Little Giggles' },
  { id: 'k-4', src: '/assets/comperessed images/BABY/0B6A9417.webp', category: 'KIDS', title: 'Curious Eyes' },
  { id: 'k-5', src: '/assets/comperessed images/BABY/0B6A9423.webp', category: 'KIDS', title: 'Adorable Expressions' },
  { id: 'k-6', src: '/assets/comperessed images/BABY/0B6A9430.webp', category: 'KIDS', title: 'Studio Milestone' },
  { id: 'k-7', src: '/assets/comperessed images/BABY/0B6A9434.webp', category: 'KIDS', title: 'Sweet Childhood' },
  { id: 'k-9', src: '/assets/comperessed images/BABY/1B9A6122.webp', category: 'KIDS', title: 'First Birthday Joy' },
  { id: 'k-10', src: '/assets/comperessed images/BABY/1B9A6123.webp', category: 'KIDS', title: 'Playful Laughter' },
  { id: 'k-11', src: '/assets/comperessed images/BABY/1B9A6266.webp', category: 'KIDS', title: 'Little Wonder' },
  { id: 'k-12', src: '/assets/comperessed images/BABY/DSC_7961.webp', category: 'KIDS', title: 'Innocent Moments' },
  { id: 'k-13', src: '/assets/comperessed images/BABY/DSC_8047.webp', category: 'KIDS', title: 'Childhood Treasures' },
  { id: 'k-14', src: '/assets/comperessed images/BABY/DSC_8226.webp', category: 'KIDS', title: 'Warm Toddler Portrait' },
]

const CATEGORIES = ['ALL', 'WEDDINGS', 'PREVIEW ALBUMN', 'BABY SHOWER', 'COUPLES', 'KIDS'] as const

interface ProjectsPageProps {
  onNavigateHome: (e: React.MouseEvent) => void
  theme?: 'dark' | 'light'
}

export default function ProjectsPage({ onNavigateHome, theme = 'light' }: ProjectsPageProps) {
  const { projects: cmsProjects, categories: cmsCategories } = useCMS()
  const [activeCat, setActiveCat] = useState<string>('ALL')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isDark = theme === 'dark'

  // Disabled category names set (uppercase)
  const disabledCategoryNames = useMemo(() => {
    if (!cmsCategories) return new Set<string>()
    return new Set(
      cmsCategories
        .filter((c) => c.is_active === false)
        .map((c) => c.name.trim().toUpperCase())
    )
  }, [cmsCategories])

  // Dynamic category names with 'ALL' as default first tab (only active categories)
  const categoryTabs = useMemo(() => {
    if (cmsCategories && cmsCategories.length > 0) {
      const activeCats = cmsCategories.filter((c) => c.is_active !== false)
      return ['ALL', ...activeCats.map((c) => c.name)]
    }
    return ['ALL', 'WEDDINGS', 'PREVIEW ALBUMN', 'BABY SHOWER', 'COUPLES', 'KIDS']
  }, [cmsCategories])

  // Map CMS projects to GalleryItem list with custom upload overrides (excluding disabled categories)
  const galleryData: GalleryItem[] = useMemo(() => {
    const rawList = cmsProjects && cmsProjects.length > 0 ? cmsProjects : DEFAULT_GALLERY_DATA.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      default_src: d.src,
      custom_src: null,
      type: 'image' as const,
      youtube_url: null,
      display_order: 1,
      is_active: true,
    }))

    return rawList
      .filter((p) => p.is_active !== false && !disabledCategoryNames.has(p.category.trim().toUpperCase()))
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        src: p.custom_src || p.default_src,
        type: p.type || (p.youtube_url ? 'video' : 'image'),
        youtube_url: p.youtube_url,
      }))
  }, [cmsProjects, disabledCategoryNames])

  // Create an interleaved order for the 'ALL' tab (only active categories)
  const allInterleavedData: GalleryItem[] = useMemo(() => {
    const result: GalleryItem[] = []
    const catKeys = categoryTabs.filter((c) => c !== 'ALL')
    const catBuckets: Record<string, GalleryItem[]> = {}

    catKeys.forEach((key) => {
      catBuckets[key] = galleryData.filter((i) => i.category.trim().toUpperCase() === key.trim().toUpperCase())
    })

    let index = 0
    let added = true

    while (added) {
      added = false
      for (const key of catKeys) {
        if (catBuckets[key] && catBuckets[key][index]) {
          result.push(catBuckets[key][index])
          added = true
        }
      }
      index++
    }

    return result
  }, [galleryData, categoryTabs])

  // Filter items based on selected tab
  const currentItems = useMemo(() => {
    if (activeCat.trim().toUpperCase() === 'ALL') {
      return allInterleavedData
    }
    return galleryData.filter(
      (item) => item.category.trim().toUpperCase() === activeCat.trim().toUpperCase()
    )
  }, [activeCat, allInterleavedData, galleryData])

  const handleCloseLightbox = () => {
    setLightboxIndex(null)
  }

  const handleNextLightbox = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % currentItems.length))
  }, [lightboxIndex, currentItems.length])

  const handlePrevLightbox = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + currentItems.length) % currentItems.length))
  }, [lightboxIndex, currentItems.length])

  // Keyboard navigation & body scroll lock for Lightbox
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') handleCloseLightbox()
      if (e.key === 'ArrowRight') handleNextLightbox()
      if (e.key === 'ArrowLeft') handlePrevLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, handleNextLightbox, handlePrevLightbox])

  return (
    <div
      className={`min-h-screen font-sans pt-24 pb-20 transition-colors duration-400 ${
        isDark ? 'bg-[#0c0b09] text-[#f2ece0]' : 'bg-[#faf9f6] text-[#1c1917]'
      }`}
    >
      {/* HEADER & CATEGORY NAVIGATION */}
      <section className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 pt-6 pb-10">
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between border-b pb-8 gap-6 ${
            isDark ? 'border-[#f2ece0]/10' : 'border-[#1c1917]/10'
          }`}
        >
          <div>
            <div
              className={`inline-flex items-center gap-2.5 text-[11px] tracking-[0.35em] uppercase mb-3 font-semibold ${
                isDark ? 'text-[#D07A55]' : 'text-[#A85532]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#D07A55]' : 'bg-[#A85532]'}`} />
              Pinterest Gallery Showcase
            </div>
            <h1
              className={`font-['Cormorant_Garamond'] font-semibold leading-[1.05] ${
                isDark ? 'text-[#f2ece0]' : 'text-[#1c1917]'
              }`}
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
            >
              Visual Archives &amp; Moments.
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className={`inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.25em] uppercase px-6 py-3 border transition-all duration-300 rounded-[12px] ${
                isDark
                  ? 'border-[#D07A55]/60 text-[#D07A55] hover:bg-[#D07A55] hover:text-[#0c0b09]'
                  : 'border-[#A85532]/60 text-[#A85532] hover:bg-[#A85532] hover:text-[#ffffff]'
              }`}
            >
              <span>← Back To Home</span>
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-8">
          {categoryTabs.map((cat) => {
            const isActive = activeCat.toUpperCase() === cat.toUpperCase()
            const count = cat.toUpperCase() === 'ALL'
              ? galleryData.length
              : galleryData.filter((i) => i.category.toUpperCase() === cat.toUpperCase()).length

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCat(cat)
                  setLightboxIndex(null)
                }}
                className={`text-[11px] tracking-[0.2em] uppercase px-5 py-3 font-medium transition-all duration-300 rounded-[12px] border flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-[#D07A55] text-[#0c0b09] border-[#D07A55] shadow-lg shadow-[#D07A55]/20 font-bold scale-[1.02]'
                      : 'bg-[#A85532] text-[#ffffff] border-[#A85532] shadow-md shadow-[#A85532]/20 font-bold scale-[1.02]'
                    : isDark
                      ? 'bg-[#14120e]/80 text-[#f2ece0]/70 border-[#f2ece0]/12 hover:border-[#D07A55]/50 hover:text-[#f2ece0]'
                      : 'bg-white text-[#1c1917]/75 border-[#1c1917]/12 hover:border-[#A85532]/50 hover:text-[#1c1917]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded-[12px] font-semibold ${
                    isActive
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
        </div>
      </section>

      {/* PINTEREST MASONRY GALLERY */}
      <section className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 pt-2">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 xl:gap-6 space-y-4 xl:space-y-6">
          {currentItems.map((item, i) => {
            const isVideo = item.type === 'video' || Boolean(item.youtube_url)

            return (
              <div
                key={item.id + i}
                className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1.5"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  decoding="async"
                  loading="lazy"
                  className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Video Play Overlay */}
                {isVideo && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-black/20">
                    <div className="w-14 h-14 rounded-full bg-[#A85532] text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-115 group-hover:bg-[#1c1917] border border-white/20">
                      <span className="text-xl ml-1">▶</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-white uppercase font-bold mt-2.5 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
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
            )
          })}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && currentItems[lightboxIndex] && (
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
                  {currentItems[lightboxIndex].category}
                </span>
                <h3 className="font-['Cormorant_Garamond'] font-semibold text-lg sm:text-xl text-white/90 hidden sm:block">
                  {currentItems[lightboxIndex].title}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 font-mono tracking-wider">
                  {lightboxIndex + 1} / {currentItems.length}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="text-white/80 hover:text-white text-xs tracking-widest font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-[12px] backdrop-blur-md border border-white/10 transition-all cursor-pointer"
                >
                  ✕ ESC CLOSE
                </button>
              </div>
            </div>

            <div className="relative w-full max-h-[85vh] flex justify-center items-center overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/90">
              {currentItems[lightboxIndex].type === 'video' || currentItems[lightboxIndex].youtube_url ? (
                <div className="w-full aspect-video max-h-[80vh] bg-black flex items-center justify-center rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(currentItems[lightboxIndex].youtube_url || '')}?autoplay=1`}
                    title={currentItems[lightboxIndex].title}
                    className="w-full h-full border-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={currentItems[lightboxIndex].src}
                  alt={currentItems[lightboxIndex].title}
                  className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg select-none"
                />
              )}

              {currentItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevLightbox()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#D07A55] text-white transition-all backdrop-blur-md border border-white/15 shadow-xl hover:scale-110 cursor-pointer"
                  aria-label="Previous photo"
                >
                  ←
                </button>
              )}

              {currentItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextLightbox()
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
    </div>
  )
}
