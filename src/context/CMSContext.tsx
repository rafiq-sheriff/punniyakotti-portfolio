import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase, type SiteSectionAsset, type CMSProject, type CinematicFilm, type ProjectCategory } from '../lib/supabase'

export const DEFAULT_CATEGORIES: ProjectCategory[] = [
  { id: 'cat-1', name: 'WEDDINGS', display_order: 1, is_active: true, is_default: true },
  { id: 'cat-2', name: 'PREVIEW ALBUMN', display_order: 2, is_active: true, is_default: true },
  { id: 'cat-3', name: 'BABY SHOWER', display_order: 3, is_active: true, is_default: true },
  { id: 'cat-4', name: 'COUPLES', display_order: 4, is_active: true, is_default: true },
  { id: 'cat-5', name: 'KIDS', display_order: 5, is_active: true, is_default: true },
]

const DEFAULT_CAT_IDS = new Set(['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'])
const DEFAULT_CAT_NAMES = new Set(['WEDDINGS', 'PREVIEW ALBUMN', 'BABY SHOWER', 'COUPLES', 'KIDS'])

export function isDefaultCategory(cat: ProjectCategory): boolean {
  if (cat.is_default) return true
  if (DEFAULT_CAT_IDS.has(cat.id)) return true
  if (DEFAULT_CAT_NAMES.has(cat.name.trim().toUpperCase())) return true
  return false
}

// All 89 default photography images across all 5 folders in public/assets/comperessed images
export const DEFAULT_PROJECTS: CMSProject[] = [
  // WEDDINGS (16 items)
  { id: 'w-1', default_src: '/assets/comperessed images/WEDDING/DSC_4729.webp', category: 'WEDDINGS', title: 'Royal Heritage Wedding', display_order: 1, is_active: true },
  { id: 'w-2', default_src: '/assets/comperessed images/WEDDING/DSC_4806.webp', category: 'WEDDINGS', title: 'Sacred Vows & Rituals', display_order: 2, is_active: true },
  { id: 'w-3', default_src: '/assets/comperessed images/WEDDING/DSC_4811.webp', category: 'WEDDINGS', title: 'Bridal Elegance', display_order: 3, is_active: true },
  { id: 'w-4', default_src: '/assets/comperessed images/WEDDING/DSC_4818.webp', category: 'WEDDINGS', title: 'Ceremonial Moments', display_order: 4, is_active: true },
  { id: 'w-5', default_src: '/assets/comperessed images/WEDDING/DSC_4835.webp', category: 'WEDDINGS', title: 'Joyful Celebrations', display_order: 5, is_active: true },
  { id: 'w-6', default_src: '/assets/comperessed images/WEDDING/DSC_4844.webp', category: 'WEDDINGS', title: 'Traditional Union', display_order: 6, is_active: true },
  { id: 'w-7', default_src: '/assets/comperessed images/WEDDING/DSC_4858.webp', category: 'WEDDINGS', title: 'Ethereal Bridal Frame', display_order: 7, is_active: true },
  { id: 'w-8', default_src: '/assets/comperessed images/WEDDING/DSC_4869.webp', category: 'WEDDINGS', title: 'Candid Couple Smiles', display_order: 8, is_active: true },
  { id: 'w-9', default_src: '/assets/comperessed images/WEDDING/DSC_4873.webp', category: 'WEDDINGS', title: 'Blessings & Rituals', display_order: 9, is_active: true },
  { id: 'w-10', default_src: '/assets/comperessed images/WEDDING/RAM_0100.webp', category: 'WEDDINGS', title: 'Grand Heritage Celebration', display_order: 10, is_active: true },
  { id: 'w-11', default_src: '/assets/comperessed images/WEDDING/RAM_0103.webp', category: 'WEDDINGS', title: 'Sunset Couple Portrait', display_order: 11, is_active: true },
  { id: 'w-12', default_src: '/assets/comperessed images/WEDDING/12 345680.webp', category: 'WEDDINGS', title: 'Timeless Wedding Story', display_order: 12, is_active: true },
  { id: 'w-13', default_src: '/assets/comperessed images/WEDDING/CRT02 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 01', display_order: 13, is_active: true },
  { id: 'w-14', default_src: '/assets/comperessed images/WEDDING/CRT03 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 02', display_order: 14, is_active: true },
  { id: 'w-15', default_src: '/assets/comperessed images/WEDDING/CRT03 2.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 03', display_order: 15, is_active: true },
  { id: 'w-16', default_src: '/assets/comperessed images/WEDDING/CRT12 1.webp', category: 'WEDDINGS', title: 'Creative Editorial Frame 04', display_order: 16, is_active: true },

  // PREVIEW ALBUMN (22 items)
  { id: 'pa-1', default_src: '/assets/comperessed images/PREVIEW ALBUMN/01.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 01', display_order: 1, is_active: true },
  { id: 'pa-2', default_src: '/assets/comperessed images/PREVIEW ALBUMN/04.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 04', display_order: 2, is_active: true },
  { id: 'pa-3', default_src: '/assets/comperessed images/PREVIEW ALBUMN/06.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 06', display_order: 3, is_active: true },
  { id: 'pa-4', default_src: '/assets/comperessed images/PREVIEW ALBUMN/10.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 10', display_order: 4, is_active: true },
  { id: 'pa-5', default_src: '/assets/comperessed images/PREVIEW ALBUMN/14.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 14', display_order: 5, is_active: true },
  { id: 'pa-6', default_src: '/assets/comperessed images/PREVIEW ALBUMN/15.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 15', display_order: 6, is_active: true },
  { id: 'pa-7', default_src: '/assets/comperessed images/PREVIEW ALBUMN/18.webp', category: 'PREVIEW ALBUMN', title: 'Album Spread 18', display_order: 7, is_active: true },
  { id: 'pa-8', default_src: '/assets/comperessed images/PREVIEW ALBUMN/CRT08.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 08', display_order: 8, is_active: true },
  { id: 'pa-9', default_src: '/assets/comperessed images/PREVIEW ALBUMN/CRT10.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 10', display_order: 9, is_active: true },
  { id: 'pa-10', default_src: '/assets/comperessed images/PREVIEW ALBUMN/CRT12.webp', category: 'PREVIEW ALBUMN', title: 'Creative Layout 12', display_order: 10, is_active: true },
  { id: 'pa-11', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0018.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 18', display_order: 11, is_active: true },
  { id: 'pa-12', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0019.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 19', display_order: 12, is_active: true },
  { id: 'pa-13', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0020.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 20', display_order: 13, is_active: true },
  { id: 'pa-14', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0021.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 21', display_order: 14, is_active: true },
  { id: 'pa-15', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0022.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 22', display_order: 15, is_active: true },
  { id: 'pa-16', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0028.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 28', display_order: 16, is_active: true },
  { id: 'pa-17', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240213-WA0031.webp', category: 'PREVIEW ALBUMN', title: 'Fine Art Storyboard 31', display_order: 17, is_active: true },
  { id: 'pa-18', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0009.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 09', display_order: 18, is_active: true },
  { id: 'pa-19', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0014.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 14', display_order: 19, is_active: true },
  { id: 'pa-20', default_src: '/assets/comperessed images/PREVIEW ALBUMN/IMG-20240717-WA0016.webp', category: 'PREVIEW ALBUMN', title: 'Luxury Album Showcase 16', display_order: 20, is_active: true },
  { id: 'pa-21', default_src: '/assets/comperessed images/PREVIEW ALBUMN/SAVE_20250610_192917.webp', category: 'PREVIEW ALBUMN', title: 'Archival Print Spread 17', display_order: 21, is_active: true },
  { id: 'pa-22', default_src: '/assets/comperessed images/PREVIEW ALBUMN/SAVE_20250610_192925.webp', category: 'PREVIEW ALBUMN', title: 'Archival Print Spread 25', display_order: 22, is_active: true },

  // BABY SHOWER (28 items)
  { id: 'bs-1', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1749.webp', category: 'BABY SHOWER', title: 'Traditional Seemantham', display_order: 1, is_active: true },
  { id: 'bs-2', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1765.webp', category: 'BABY SHOWER', title: 'Blessings Ceremony', display_order: 2, is_active: true },
  { id: 'bs-3', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1775.webp', category: 'BABY SHOWER', title: 'Floral Offerings', display_order: 3, is_active: true },
  { id: 'bs-4', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1789.webp', category: 'BABY SHOWER', title: 'Family Happiness', display_order: 4, is_active: true },
  { id: 'bs-5', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1790.webp', category: 'BABY SHOWER', title: 'Warm Wishes', display_order: 5, is_active: true },
  { id: 'bs-6', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1817.webp', category: 'BABY SHOWER', title: 'Sacred Ritual', display_order: 6, is_active: true },
  { id: 'bs-7', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1829.webp', category: 'BABY SHOWER', title: 'Motherhood Glow', display_order: 7, is_active: true },
  { id: 'bs-8', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1834.webp', category: 'BABY SHOWER', title: 'Seemantham Celebration', display_order: 8, is_active: true },
  { id: 'bs-9', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1836.webp', category: 'BABY SHOWER', title: 'Joyful Moments', display_order: 9, is_active: true },
  { id: 'bs-10', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1895.webp', category: 'BABY SHOWER', title: 'Cherished Memories', display_order: 10, is_active: true },
  { id: 'bs-11', default_src: '/assets/comperessed images/BABYSHOWER/_DSC1949.webp', category: 'BABY SHOWER', title: 'Family Gathering', display_order: 11, is_active: true },
  { id: 'bs-12', default_src: '/assets/comperessed images/BABYSHOWER/_DSC2247.webp', category: 'BABY SHOWER', title: 'Golden Blessing', display_order: 12, is_active: true },
  { id: 'bs-13', default_src: '/assets/comperessed images/BABYSHOWER/_DSC2351.webp', category: 'BABY SHOWER', title: 'Radiant Smile', display_order: 13, is_active: true },
  { id: 'bs-14', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8829 - Copy.webp', category: 'BABY SHOWER', title: 'Expectant Couple', display_order: 14, is_active: true },
  { id: 'bs-15', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8839 - Copy.webp', category: 'BABY SHOWER', title: 'Ceremonial Bangle Ritual', display_order: 15, is_active: true },
  { id: 'bs-16', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8860 - Copy.webp', category: 'BABY SHOWER', title: 'Festive Decoration', display_order: 16, is_active: true },
  { id: 'bs-17', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8930 - Copy.webp', category: 'BABY SHOWER', title: 'Happy Family', display_order: 17, is_active: true },
  { id: 'bs-18', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8937 - Copy.webp', category: 'BABY SHOWER', title: 'Warm Smiles', display_order: 18, is_active: true },
  { id: 'bs-19', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8943 - Copy.webp', category: 'BABY SHOWER', title: 'Blessings Portrait', display_order: 19, is_active: true },
  { id: 'bs-20', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8954 - Copy.webp', category: 'BABY SHOWER', title: 'Family Tradition', display_order: 20, is_active: true },
  { id: 'bs-21', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8972 - Copy.webp', category: 'BABY SHOWER', title: 'Floral Decor', display_order: 21, is_active: true },
  { id: 'bs-22', default_src: '/assets/comperessed images/BABYSHOWER/0B6A8986 - Copy.webp', category: 'BABY SHOWER', title: 'Celebration Frame', display_order: 22, is_active: true },
  { id: 'bs-23', default_src: '/assets/comperessed images/BABYSHOWER/0B6A9078 - Copy.webp', category: 'BABY SHOWER', title: 'Happy Moments', display_order: 23, is_active: true },
  { id: 'bs-24', default_src: '/assets/comperessed images/BABYSHOWER/0B6A9195 - Copy.webp', category: 'BABY SHOWER', title: 'Grandparents Blessing', display_order: 24, is_active: true },
  { id: 'bs-25', default_src: '/assets/comperessed images/BABYSHOWER/0B6A9217 - Copy.webp', category: 'BABY SHOWER', title: 'Sweet Laughter', display_order: 25, is_active: true },
  { id: 'bs-26', default_src: '/assets/comperessed images/BABYSHOWER/0B6A9390.webp', category: 'BABY SHOWER', title: 'Traditional Elegance', display_order: 26, is_active: true },
  { id: 'bs-27', default_src: '/assets/comperessed images/BABYSHOWER/0B6A9527.webp', category: 'BABY SHOWER', title: 'Precious Memories', display_order: 27, is_active: true },
  { id: 'bs-28', default_src: '/assets/comperessed images/BABYSHOWER/1B9A4827.webp', category: 'BABY SHOWER', title: 'Family Heirloom', display_order: 28, is_active: true },

  // COUPLES (10 items)
  { id: 'c-1', default_src: '/assets/comperessed images/COUPLES/RAM_0599.webp', category: 'COUPLES', title: 'Sunset Coastal Romance', display_order: 1, is_active: true },
  { id: 'c-2', default_src: '/assets/comperessed images/COUPLES/5I2A0403.webp', category: 'COUPLES', title: 'Golden Hour Embrace', display_order: 2, is_active: true },
  { id: 'c-3', default_src: '/assets/comperessed images/COUPLES/0B6A0809.webp', category: 'COUPLES', title: 'Intimate Connection', display_order: 3, is_active: true },
  { id: 'c-4', default_src: '/assets/comperessed images/COUPLES/0B6A0822.webp', category: 'COUPLES', title: 'Candid Laughter', display_order: 4, is_active: true },
  { id: 'c-5', default_src: '/assets/comperessed images/COUPLES/0B6A0829.webp', category: 'COUPLES', title: 'Romantic Walk', display_order: 5, is_active: true },
  { id: 'c-6', default_src: '/assets/comperessed images/COUPLES/0B6A0831.webp', category: 'COUPLES', title: 'Pre-Wedding Magic', display_order: 6, is_active: true },
  { id: 'c-7', default_src: '/assets/comperessed images/COUPLES/0B6A0923.webp', category: 'COUPLES', title: 'Love & Warmth', display_order: 7, is_active: true },
  { id: 'c-8', default_src: '/assets/comperessed images/COUPLES/0B6A0961.webp', category: 'COUPLES', title: 'Heritage Backdrop', display_order: 8, is_active: true },
  { id: 'c-9', default_src: '/assets/comperessed images/COUPLES/0B6A0975.webp', category: 'COUPLES', title: 'Golden Light Portrait', display_order: 9, is_active: true },
  { id: 'c-10', default_src: '/assets/comperessed images/COUPLES/0B6A0986.webp', category: 'COUPLES', title: 'Timeless Together', display_order: 10, is_active: true },

  // KIDS (13 items)
  { id: 'k-1', default_src: '/assets/comperessed images/BABY/03.webp', category: 'KIDS', title: 'Pure Joy & Innocence', display_order: 1, is_active: true },
  { id: 'k-2', default_src: '/assets/comperessed images/BABY/0B6A8894 - Copy.webp', category: 'KIDS', title: 'Playful Milestones', display_order: 2, is_active: true },
  { id: 'k-3', default_src: '/assets/comperessed images/BABY/0B6A8912 - Copy.webp', category: 'KIDS', title: 'Little Giggles', display_order: 3, is_active: true },
  { id: 'k-4', default_src: '/assets/comperessed images/BABY/0B6A9417.webp', category: 'KIDS', title: 'Curious Eyes', display_order: 4, is_active: true },
  { id: 'k-5', default_src: '/assets/comperessed images/BABY/0B6A9423.webp', category: 'KIDS', title: 'Adorable Expressions', display_order: 5, is_active: true },
  { id: 'k-6', default_src: '/assets/comperessed images/BABY/0B6A9430.webp', category: 'KIDS', title: 'Studio Milestone', display_order: 6, is_active: true },
  { id: 'k-7', default_src: '/assets/comperessed images/BABY/0B6A9434.webp', category: 'KIDS', title: 'Sweet Childhood', display_order: 7, is_active: true },
  { id: 'k-9', default_src: '/assets/comperessed images/BABY/1B9A6122.webp', category: 'KIDS', title: 'First Birthday Joy', display_order: 8, is_active: true },
  { id: 'k-10', default_src: '/assets/comperessed images/BABY/1B9A6123.webp', category: 'KIDS', title: 'Playful Laughter', display_order: 9, is_active: true },
  { id: 'k-11', default_src: '/assets/comperessed images/BABY/1B9A6266.webp', category: 'KIDS', title: 'Little Wonder', display_order: 10, is_active: true },
  { id: 'k-12', default_src: '/assets/comperessed images/BABY/DSC_7961.webp', category: 'KIDS', title: 'Innocent Moments', display_order: 11, is_active: true },
  { id: 'k-13', default_src: '/assets/comperessed images/BABY/DSC_8047.webp', category: 'KIDS', title: 'Childhood Treasures', display_order: 12, is_active: true },
  { id: 'k-14', default_src: '/assets/comperessed images/BABY/DSC_8226.webp', category: 'KIDS', title: 'Warm Toddler Portrait', display_order: 13, is_active: true },
]

export const DEFAULT_FILMS: CinematicFilm[] = [
  {
    id: 'film-1',
    title: 'Cinematic Wedding Film',
    subtitle: 'Punniyakotti Photography & Film Studio',
    youtube_url: 'https://www.youtube.com/watch?v=b68HETiNO98',
    default_cover_url: '/assets/image/services/Wedding.webp',
    display_order: 1,
    is_active: true,
  },
]

interface CMSContextType {
  sectionAssets: Record<string, SiteSectionAsset>
  projects: CMSProject[]
  categories: ProjectCategory[]
  cinematicFilms: CinematicFilm[]
  loading: boolean
  getSectionAsset: (sectionId: string, defaultSrc: string) => { src: string; isCustom: boolean; isDisabled: boolean }
  updateSectionAsset: (
    sectionId: string,
    sectionName: string,
    imagePurpose: string,
    customUrl: string | null,
    isDisabled?: boolean
  ) => Promise<void>
  addProject: (project: Omit<CMSProject, 'id'>) => Promise<void>
  updateProject: (id: string, updates: Partial<CMSProject>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  resetProjectImage: (id: string) => Promise<void>

  // Dynamic Category Tab Methods
  addCategory: (name: string) => Promise<void>
  updateCategoryName: (id: string, newName: string) => Promise<void>
  toggleCategoryActive: (id: string) => Promise<void>
  reorderCategories: (reorderedList: ProjectCategory[]) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Cinematic Films Methods
  addFilm: (film: Omit<CinematicFilm, 'id'>) => Promise<void>
  updateFilm: (id: string, updates: Partial<CinematicFilm>) => Promise<void>
  deleteFilm: (id: string) => Promise<void>
  resetFilmCover: (id: string) => Promise<void>

  refreshCMS: () => Promise<void>
}

const CMSContext = createContext<CMSContextType | undefined>(undefined)

const LOCAL_STORAGE_CAT_KEY = 'puniyakotti_cms_categories'

function getStoredCategories(): ProjectCategory[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CAT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Could not read stored categories:', e)
  }
  return null
}

function saveStoredCategories(cats: ProjectCategory[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CAT_KEY, JSON.stringify(cats))
  } catch (e) {
    console.warn('Could not save stored categories:', e)
  }
}

export function CMSProvider({ children }: { children: ReactNode }) {
  const [sectionAssets, setSectionAssets] = useState<Record<string, SiteSectionAsset>>({})
  const [projects, setProjects] = useState<CMSProject[]>(DEFAULT_PROJECTS)
  const [categories, setCategories] = useState<ProjectCategory[]>(() => {
    return getStoredCategories() || DEFAULT_CATEGORIES
  })
  const [cinematicFilms, setCinematicFilms] = useState<CinematicFilm[]>(DEFAULT_FILMS)
  const [loading, setLoading] = useState(true)

  const fetchCMSData = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Fetch site section assets
      const { data: assetsData } = await supabase
        .from('site_section_assets')
        .select('*')

      if (assetsData) {
        const assetMap: Record<string, SiteSectionAsset> = {}
        assetsData.forEach((item: SiteSectionAsset) => {
          assetMap[item.section_id] = item
        })
        setSectionAssets(assetMap)
      }

      // 2. Fetch categories
      const { data: catData } = await supabase
        .from('project_categories')
        .select('*')
        .order('display_order', { ascending: true })

      const localSaved = getStoredCategories()
      const dbCatMap = new Map((catData || []).map((c: ProjectCategory) => [c.id, c]))
      const dbCatNameMap = new Map((catData || []).map((c: ProjectCategory) => [c.name.trim().toUpperCase(), c]))
      const localCatMap = new Map((localSaved || []).map((c: ProjectCategory) => [c.id, c]))
      const localCatNameMap = new Map((localSaved || []).map((c: ProjectCategory) => [c.name.trim().toUpperCase(), c]))

      const mergedCats = DEFAULT_CATEGORIES.map((def) => {
        const localItem = localCatMap.get(def.id) || localCatNameMap.get(def.name.trim().toUpperCase())
        const dbItem = dbCatMap.get(def.id) || dbCatNameMap.get(def.name.trim().toUpperCase())

        const isActive = localItem?.is_active !== undefined
          ? localItem.is_active
          : dbItem?.is_active !== undefined
          ? dbItem.is_active
          : true

        const displayOrder = localItem?.display_order !== undefined
          ? localItem.display_order
          : dbItem?.display_order !== undefined
          ? dbItem.display_order
          : def.display_order

        const name = localItem?.name || dbItem?.name || def.name

        return {
          ...def,
          name,
          display_order: displayOrder,
          is_active: isActive,
        }
      })

      const allCustoms = [...(localSaved || []), ...(catData || [])]
      allCustoms.forEach((c: ProjectCategory) => {
        if (!mergedCats.some((m) => m.id === c.id || m.name.trim().toUpperCase() === c.name.trim().toUpperCase())) {
          mergedCats.push({
            ...c,
            is_active: c.is_active !== undefined ? c.is_active : true,
          })
        }
      })

      mergedCats.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      setCategories(mergedCats)
      saveStoredCategories(mergedCats)

      // 3. Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })

      if (!projectsError && projectsData && projectsData.length > 0) {
        const dbProjectMap = new Map(projectsData.map((p: CMSProject) => [p.id, p]))

        const mergedProjects = DEFAULT_PROJECTS.map((def) => {
          const dbItem = dbProjectMap.get(def.id)
          return dbItem ? { ...def, ...dbItem } : def
        })

        projectsData.forEach((dbItem: CMSProject) => {
          if (!DEFAULT_PROJECTS.some((def) => def.id === dbItem.id)) {
            mergedProjects.push(dbItem)
          }
        })

        setProjects(mergedProjects)
      } else {
        setProjects(DEFAULT_PROJECTS)
      }

      // 4. Fetch Cinematic Films
      const { data: filmsData, error: filmsError } = await supabase
        .from('cinematic_films')
        .select('*')
        .order('display_order', { ascending: true })

      if (!filmsError && filmsData && filmsData.length > 0) {
        setCinematicFilms(filmsData)
      } else {
        setCinematicFilms(DEFAULT_FILMS)
      }
    } catch (err) {
      console.warn('Supabase CMS connection warning (using default local assets):', err)
      setProjects(DEFAULT_PROJECTS)
      setCategories(DEFAULT_CATEGORIES)
      setCinematicFilms(DEFAULT_FILMS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCMSData()
  }, [fetchCMSData])

  const getSectionAsset = useCallback((sectionId: string, defaultSrc: string) => {
    const asset = sectionAssets[sectionId]
    const isDisabled = Boolean(asset?.is_disabled)
    const customUrl = asset?.custom_image_url

    if (customUrl && customUrl.trim() !== '') {
      return { src: customUrl, isCustom: true, isDisabled }
    }
    return { src: defaultSrc, isCustom: false, isDisabled }
  }, [sectionAssets])

  const updateSectionAsset = async (
    sectionId: string,
    sectionName: string,
    imagePurpose: string,
    customUrl: string | null,
    isDisabled?: boolean
  ) => {
    const existing = sectionAssets[sectionId]
    const finalDisabled = isDisabled !== undefined ? isDisabled : existing?.is_disabled ?? false

    const payload = {
      section_id: sectionId,
      section_name: sectionName,
      image_purpose: imagePurpose,
      custom_image_url: customUrl,
      is_disabled: finalDisabled,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('site_section_assets')
      .upsert(payload, { onConflict: 'section_id' })

    if (error) throw new Error(error.message)

    setSectionAssets((prev) => ({
      ...prev,
      [sectionId]: payload,
    }))
  }

  // Category Tab Handlers
  const addCategory = async (name: string) => {
    const trimmed = name.trim().toUpperCase()
    if (!trimmed) return
    if (categories.some((c) => c.name.toUpperCase() === trimmed)) {
      throw new Error(`Category "${trimmed}" already exists.`)
    }

    const newId = `cat_${Date.now()}`
    const newCat: ProjectCategory = {
      id: newId,
      name: trimmed,
      display_order: categories.length + 1,
      is_active: true,
      is_default: false,
    }

    const { error } = await supabase.from('project_categories').insert(newCat)
    if (error) console.warn('Add category Supabase notice:', error.message)

    setCategories((prev) => {
      const updated = [...prev, newCat]
      saveStoredCategories(updated)
      return updated
    })
  }

  const updateCategoryName = async (id: string, newName: string) => {
    const trimmed = newName.trim().toUpperCase()
    if (!trimmed) return

    const categoryToUpdate = categories.find((c) => c.id === id)
    if (!categoryToUpdate) return

    const oldName = categoryToUpdate.name
    if (oldName.toUpperCase() === trimmed) return

    // 1. Update Category table
    const { error: catErr } = await supabase
      .from('project_categories')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (catErr) console.warn('Category update name notice:', catErr.message)

    // 2. Update existing projects that had old category name
    const { error: projErr } = await supabase
      .from('projects')
      .update({ category: trimmed })
      .eq('category', oldName)

    if (projErr) console.warn('Could not update project categories in DB:', projErr)

    // Update local state
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
      saveStoredCategories(updated)
      return updated
    })
    setProjects((prev) => prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)))
  }

  const toggleCategoryActive = async (id: string) => {
    const target = categories.find((c) => c.id === id)
    if (!target) return

    const nextActive = target.is_active === false ? true : false
    const updatedCat: ProjectCategory = {
      ...target,
      is_active: nextActive,
      updated_at: new Date().toISOString(),
    }

    setCategories((prev) => {
      const updatedList = prev.map((c) => (c.id === id ? updatedCat : c))
      saveStoredCategories(updatedList)
      return updatedList
    })

    try {
      const { error } = await supabase
        .from('project_categories')
        .upsert(updatedCat, { onConflict: 'id' })

      if (error) {
        console.warn('Category active state toggle Supabase notice:', error.message)
      }
    } catch (err) {
      console.warn('Error saving category active state:', err)
    }
  }

  const reorderCategories = async (reorderedList: ProjectCategory[]) => {
    const updatedList = reorderedList.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1,
      updated_at: new Date().toISOString(),
    }))

    setCategories(updatedList)
    saveStoredCategories(updatedList)

    const { error } = await supabase
      .from('project_categories')
      .upsert(updatedList, { onConflict: 'id' })

    if (error) console.warn('Reorder category save warning:', error.message)
  }

  const deleteCategory = async (id: string) => {
    const target = categories.find((c) => c.id === id)
    if (!target) return

    if (isDefaultCategory(target)) {
      throw new Error(`Default category tab "${target.name}" cannot be deleted. You can disable it instead.`)
    }

    const { error } = await supabase.from('project_categories').delete().eq('id', id)
    if (error) console.warn('Delete category notice:', error.message)

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      saveStoredCategories(updated)
      return updated
    })
  }

  // Project Handlers
  const addProject = async (projectData: Omit<CMSProject, 'id'>) => {
    const newId = `proj_${Date.now()}`
    const newProject: CMSProject = {
      ...projectData,
      id: newId,
    }

    const { error } = await supabase.from('projects').insert(newProject)
    if (error) throw new Error(error.message)

    setProjects((prev) => [...prev, newProject])
  }

  const updateProject = async (id: string, updates: Partial<CMSProject>) => {
    const projectToUpdate = projects.find((p) => p.id === id)
    if (!projectToUpdate) return

    const updated = { ...projectToUpdate, ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('projects')
      .upsert(updated, { onConflict: 'id' })

    if (error) throw new Error(error.message)

    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  const deleteProject = async (id: string) => {
    const isDefault = DEFAULT_PROJECTS.some((def) => def.id === id)
    if (isDefault) {
      await updateProject(id, { is_active: false })
    } else {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const resetProjectImage = async (id: string) => {
    await updateProject(id, { custom_src: null })
  }

  // Cinematic Films Handlers
  const addFilm = async (filmData: Omit<CinematicFilm, 'id'>) => {
    if (cinematicFilms.length >= 4) {
      throw new Error('Maximum limit reached: You can add only up to 4 Cinematic Film containers.')
    }

    const newId = `film_${Date.now()}`
    const newFilm: CinematicFilm = {
      ...filmData,
      id: newId,
    }

    const { error } = await supabase.from('cinematic_films').insert(newFilm)
    if (error) throw new Error(error.message)

    setCinematicFilms((prev) => [...prev, newFilm])
  }

  const updateFilm = async (id: string, updates: Partial<CinematicFilm>) => {
    const filmToUpdate = cinematicFilms.find((f) => f.id === id)
    if (!filmToUpdate) return

    const updated = { ...filmToUpdate, ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('cinematic_films')
      .upsert(updated, { onConflict: 'id' })

    if (error) throw new Error(error.message)

    setCinematicFilms((prev) => prev.map((f) => (f.id === id ? updated : f)))
  }

  const deleteFilm = async (id: string) => {
    const isDefault = DEFAULT_FILMS.some((def) => def.id === id)
    if (isDefault) {
      await updateFilm(id, { is_active: false })
    } else {
      const { error } = await supabase.from('cinematic_films').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setCinematicFilms((prev) => prev.filter((f) => f.id !== id))
    }
  }

  const resetFilmCover = async (id: string) => {
    await updateFilm(id, { custom_cover_url: null })
  }

  return (
    <CMSContext.Provider
      value={{
        sectionAssets,
        projects,
        categories,
        cinematicFilms,
        loading,
        getSectionAsset,
        updateSectionAsset,
        addProject,
        updateProject,
        deleteProject,
        resetProjectImage,
        addCategory,
        updateCategoryName,
        toggleCategoryActive,
        reorderCategories,
        deleteCategory,
        addFilm,
        updateFilm,
        deleteFilm,
        resetFilmCover,
        refreshCMS: fetchCMSData,
      }}
    >
      {children}
    </CMSContext.Provider>
  )
}

export function useCMS() {
  const context = useContext(CMSContext)
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider')
  }
  return context
}
