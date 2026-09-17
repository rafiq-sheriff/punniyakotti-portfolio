import React, { useState } from 'react'
import { useCMS, DEFAULT_PROJECTS, isDefaultCategory } from '../context/CMSContext'
import ImageUploader from './ImageUploader'
import { type CMSProject, type CinematicFilm, uploadWebsiteAsset, extractYouTubeId } from '../lib/supabase'

export default function AdminDashboard() {
  const {
    getSectionAsset,
    updateSectionAsset,
    projects,
    categories,
    addCategory,
    updateCategoryName,
    toggleCategoryActive,
    reorderCategories,
    deleteCategory,
    addProject,
    updateProject,
    deleteProject,
    resetProjectImage,
    cinematicFilms,
    addFilm,
    updateFilm,
    deleteFilm,
    resetFilmCover,
    refreshCMS,
  } = useCMS()

  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState<
    'overview' | 'about' | 'services' | 'video_drone' | 'cinematic_films' | 'wedding_story' | 'instagram' | 'projects'
  >('overview')

  // Selected Category Sub-tab in Portfolio Projects (Default to first available category)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('WEDDINGS')

  // Category Edit / Add Modal State
  const [showAddCatModal, setShowAddCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'image' | 'video'>('image')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatNameText, setEditingCatNameText] = useState('')

  // New Project Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newYtUrl, setNewYtUrl] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [addingProject, setAddingProject] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<CMSProject | null>(null)

  // Cinematic Films State
  const [showAddFilmModal, setShowAddFilmModal] = useState(false)
  const [newFilmTitle, setNewFilmTitle] = useState('')
  const [newFilmSubtitle, setNewFilmSubtitle] = useState('Punniyakotti Photography & Film Studio')
  const [newFilmYtUrl, setNewFilmYtUrl] = useState('')
  const [newFilmFile, setNewFilmFile] = useState<File | null>(null)
  const [addingFilm, setAddingFilm] = useState(false)
  const [filmError, setFilmError] = useState<string | null>(null)
  const [editingFilm, setEditingFilm] = useState<CinematicFilm | null>(null)

  // Section Asset Metadata Definition (Hero Image omitted as per requirement)
  const SECTION_CONFIGS = [
    {
      id: 'about_portrait',
      name: 'Photographer About Portrait',
      purpose: 'Main profile portrait photo in the About Me section',
      defaultSrc: '/assets/image/puniyakotti (2).webp',
      folder: 'about',
      tab: 'about',
    },

    // Services (6 Cards)
    {
      id: 'service_1',
      name: 'Service: Wedding Photography',
      purpose: 'Card background image for Wedding Photography service',
      defaultSrc: 'https://images.unsplash.com/photo-1735052712464-9d24b69be5f5?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },
    {
      id: 'service_2',
      name: 'Service: Wedding Films',
      purpose: 'Card background image for Wedding Films service',
      defaultSrc: 'https://images.unsplash.com/photo-1519741196428-6a2175fa2557?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },
    {
      id: 'service_3',
      name: 'Service: Pre-Wedding Photography',
      purpose: 'Card background image for Pre-Wedding Photography service',
      defaultSrc: 'https://images.unsplash.com/photo-1633104502699-b2ecf0fee294?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },
    {
      id: 'service_4',
      name: 'Service: Event Photography',
      purpose: 'Card background image for Event Photography service',
      defaultSrc: 'https://images.unsplash.com/photo-1764255510960-deee566a91f0?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },
    {
      id: 'service_5',
      name: 'Service: Event Videography',
      purpose: 'Card background image for Event Videography service',
      defaultSrc: 'https://images.unsplash.com/photo-1768508947605-8c7a50aed683?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },
    {
      id: 'service_6',
      name: 'Service: Drone & Aerial',
      purpose: 'Card background image for Drone & Aerial service',
      defaultSrc: 'https://images.unsplash.com/photo-1767050248602-26b7386901ce?w=640&h=480&fit=crop&auto=format&q=85',
      folder: 'services',
      tab: 'services',
    },

    // Drone & Contact
    {
      id: 'drone_bg',
      name: 'Drone Section Background',
      purpose: 'Parallax background image for Aerial Cinematography section',
      defaultSrc: '/assets/image/puniyakotti (2).webp',
      folder: 'drone',
      tab: 'video_drone',
    },
    {
      id: 'contact_bg',
      name: 'Contact Section Background',
      purpose: 'Full background image for Final Call To Action contact section',
      defaultSrc: '/assets/image/COUPLES/RAM_0599.webp',
      folder: 'contact',
      tab: 'video_drone',
    },

    // Wedding Story (6 Images)
    { id: 'wedding_story_1', name: 'Wedding Story 1: First Look', purpose: 'First look frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/First Look.webp', folder: 'wedding-story', tab: 'wedding_story' },
    { id: 'wedding_story_2', name: 'Wedding Story 2: Candid Emotion', purpose: 'Candid emotion frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/Candid Emotion.webp', folder: 'wedding-story', tab: 'wedding_story' },
    { id: 'wedding_story_3', name: 'Wedding Story 3: The Ceremony', purpose: 'Ceremony frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/The Ceremony.webp', folder: 'wedding-story', tab: 'wedding_story' },
    { id: 'wedding_story_4', name: 'Wedding Story 4: Family Moments', purpose: 'Family frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/Family Moments.webp', folder: 'wedding-story', tab: 'wedding_story' },
    { id: 'wedding_story_5', name: 'Wedding Story 5: Couple Portraits', purpose: 'Couple portrait frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/Couple Portraits.webp', folder: 'wedding-story', tab: 'wedding_story' },
    { id: 'wedding_story_6', name: 'Wedding Story 6: The Celebration', purpose: 'Celebration frame in wedding story carousel', defaultSrc: '/assets/image/Wedding Photography/The Celebration.webp', folder: 'wedding-story', tab: 'wedding_story' },

    // Instagram (9 Images)
    { id: 'insta_1', name: 'Instagram Grid Photo 1', purpose: 'First image in Instagram showcase grid', defaultSrc: '/assets/image/WEDDING/DSC_4811.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_2', name: 'Instagram Grid Photo 2', purpose: 'Second image in Instagram showcase grid', defaultSrc: '/assets/image/BABYSHOWER/_DSC1789.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_3', name: 'Instagram Grid Photo 3', purpose: 'Third image in Instagram showcase grid', defaultSrc: '/assets/image/COUPLES/RAM_0599.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_4', name: 'Instagram Grid Photo 4', purpose: 'Fourth image in Instagram showcase grid', defaultSrc: '/assets/image/BABYSHOWER/_DSC1834.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_5', name: 'Instagram Grid Photo 5', purpose: 'Fifth image in Instagram showcase grid', defaultSrc: '/assets/image/WEDDING/RAM_0103.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_6', name: 'Instagram Grid Photo 6', purpose: 'Sixth image in Instagram showcase grid', defaultSrc: '/assets/image/BABYSHOWER/_DSC2247.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_7', name: 'Instagram Grid Photo 7', purpose: 'Seventh image in Instagram showcase grid', defaultSrc: '/assets/image/BABY/0B6A9436.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_8', name: 'Instagram Grid Photo 8', purpose: 'Eighth image in Instagram showcase grid', defaultSrc: '/assets/image/BABYSHOWER/0B6A8954 - Copy.webp', folder: 'instagram', tab: 'instagram' },
    { id: 'insta_9', name: 'Instagram Grid Photo 9', purpose: 'Ninth image in Instagram showcase grid', defaultSrc: '/assets/image/BABYSHOWER/_DSC2351.webp', folder: 'instagram', tab: 'instagram' },
  ]

  // Filtered Projects for current category tab in Portfolio Projects
  const currentCategoryProjects = projects.filter(
    (p) => p.category.toUpperCase() === selectedCategoryName.toUpperCase()
  )

  // Stats
  const totalSections = SECTION_CONFIGS.length
  const totalCustomSectionImages = SECTION_CONFIGS.filter(
    (cfg) => getSectionAsset(cfg.id, cfg.defaultSrc).isCustom
  ).length

  // Add Category Handler
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      await addCategory(newCatName, newCatType)
      setSelectedCategoryName(newCatName.trim().toUpperCase())
      setShowAddCatModal(false)
      setNewCatName('')
      setNewCatType('image')
    } catch (err: any) {
      alert(err.message || 'Failed to add category tab')
    }
  }

  // Edit Category Name Handler
  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCatId || !editingCatNameText.trim()) return
    try {
      await updateCategoryName(editingCatId, editingCatNameText)
      setSelectedCategoryName(editingCatNameText.trim().toUpperCase())
      setEditingCatId(null)
      setEditingCatNameText('')
    } catch (err: any) {
      alert(err.message || 'Failed to rename category tab')
    }
  }

  // Add Project Submit (Photo or Video Asset)
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setProjectError(null)

    if (!newTitle.trim()) {
      setProjectError('Please enter a title.')
      return
    }

    const currentCatObj = categories.find((c) => c.name.toUpperCase() === selectedCategoryName.toUpperCase())
    const isVideoTab = currentCatObj?.type === 'video'

    if (isVideoTab && !newYtUrl.trim()) {
      setProjectError('Please enter a YouTube video URL.')
      return
    }

    try {
      setAddingProject(true)
      let customUrl: string | undefined = undefined

      if (newFile) {
        customUrl = await uploadWebsiteAsset(newFile, isVideoTab ? 'video_covers' : 'projects')
      }

      await addProject({
        title: newTitle,
        category: selectedCategoryName,
        default_src: customUrl || (isVideoTab ? '/assets/image/services/Wedding.webp' : '/assets/image/hero/hero.webp'),
        custom_src: customUrl,
        type: isVideoTab ? 'video' : 'image',
        youtube_url: isVideoTab ? newYtUrl : null,
        display_order: currentCategoryProjects.length + 1,
        is_active: true,
      })

      setShowAddProjectModal(false)
      setNewTitle('')
      setNewYtUrl('')
      setNewFile(null)
    } catch (err: any) {
      setProjectError(err.message || 'Failed to add asset.')
    } finally {
      setAddingProject(false)
    }
  }

  // Edit Project Submit
  const handleSaveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      setAddingProject(true)
      await updateProject(editingProject.id, {
        title: editingProject.title,
        category: editingProject.category,
        display_order: editingProject.display_order,
        is_active: editingProject.is_active,
      })
      setEditingProject(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update project')
    } finally {
      setAddingProject(false)
    }
  }

  const handleProjectImageUpload = async (projectId: string, file: File) => {
    try {
      const publicUrl = await uploadWebsiteAsset(file, 'projects')
      await updateProject(projectId, { custom_src: publicUrl })
    } catch (err: any) {
      alert(`Project image upload failed: ${err.message}`)
    }
  }

  // Add Film Submit
  const handleAddFilm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFilmError(null)

    if (!newFilmTitle.trim()) {
      setFilmError('Please enter a film title.')
      return
    }

    if (!newFilmYtUrl.trim()) {
      setFilmError('Please enter a YouTube video URL.')
      return
    }

    if (cinematicFilms.length >= 4) {
      setFilmError('Maximum limit reached: You can add only up to 4 Cinematic Film containers.')
      return
    }

    try {
      setAddingFilm(true)
      let customCoverUrl: string | undefined = undefined

      if (newFilmFile) {
        customCoverUrl = await uploadWebsiteAsset(newFilmFile, 'cinematic-films')
      }

      await addFilm({
        title: newFilmTitle,
        subtitle: newFilmSubtitle || 'Punniyakotti Photography & Film Studio',
        youtube_url: newFilmYtUrl,
        default_cover_url: '/assets/image/services/Wedding.webp',
        custom_cover_url: customCoverUrl,
        display_order: cinematicFilms.length + 1,
        is_active: true,
      })

      setShowAddFilmModal(false)
      setNewFilmTitle('')
      setNewFilmYtUrl('')
      setNewFilmFile(null)
    } catch (err: any) {
      setFilmError(err.message || 'Failed to add film container.')
    } finally {
      setAddingFilm(false)
    }
  }

  const handleSaveFilmEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFilm) return

    try {
      setAddingFilm(true)
      await updateFilm(editingFilm.id, {
        title: editingFilm.title,
        subtitle: editingFilm.subtitle,
        youtube_url: editingFilm.youtube_url,
        is_active: editingFilm.is_active,
        display_order: editingFilm.display_order,
      })
      setEditingFilm(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update film container')
    } finally {
      setAddingFilm(false)
    }
  }

  const handleFilmCoverUpload = async (filmId: string, file: File) => {
    try {
      const publicUrl = await uploadWebsiteAsset(file, 'cinematic-films')
      await updateFilm(filmId, { custom_cover_url: publicUrl })
    } catch (err: any) {
      alert(`Film cover upload failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Light Theme Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'about', label: '👤 About Section' },
          { id: 'services', label: '✨ Services (6)' },
          { id: 'cinematic_films', label: `🎬 Cinematic Films (${cinematicFilms.length}/4)` },
          { id: 'video_drone', label: '🎥 Drone & Contact Section' },
          { id: 'wedding_story', label: '💍 Wedding Story (6)' },
          { id: 'instagram', label: '📸 Instagram Grid (9)' },
          { id: 'projects', label: '📁 Portfolio Projects' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-['Manrope'] font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#A85532] text-white shadow-md'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <span className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wider block mb-2">
                Managed Website Sections
              </span>
              <p className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#A85532]">
                {totalSections}
              </p>
              <p className="text-stone-500 text-xs mt-2 font-medium">
                About, Services, Cinematic Films, Drone, Wedding Story, Instagram, Contact
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <span className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wider block mb-2">
                Portfolio Categories / Tabs
              </span>
              <p className="font-['Cormorant_Garamond'] text-4xl font-bold text-sky-600">
                {categories.length}
              </p>
              <p className="text-stone-500 text-xs mt-2 font-medium">
                Editable &amp; Custom Dynamic Tabs
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <span className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wider block mb-2">
                Total Portfolio Items
              </span>
              <p className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#1c1917]">
                {projects.length}
              </p>
              <p className="text-stone-500 text-xs mt-2 font-medium">
                Weddings, Albums, Baby Shower, Couples &amp; Kids items
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <span className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wider block mb-2">
                Custom Overrides Active
              </span>
              <p className="font-['Cormorant_Garamond'] text-4xl font-bold text-emerald-600">
                {totalCustomSectionImages}
              </p>
              <p className="text-stone-500 text-xs mt-2 font-medium">
                Uploaded images replacing default assets
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#A85532]/10 border border-[#A85532]/30 text-[#A85532] text-xs font-bold uppercase tracking-wider rounded-lg">
                CMS Guidelines &amp; Category Rules
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
              Portfolio Projects &amp; Tab Management
            </h3>
            <div className="space-y-3 text-stone-600 text-sm leading-relaxed max-w-4xl">
              <p>
                • <strong>Individual Category Tabs</strong>: In the Portfolio Projects section, images are organized into individual tabs (e.g. <code>WEDDINGS</code>, <code>PREVIEW ALBUMN</code>, <code>BABY SHOWER</code>, <code>COUPLES</code>, <code>KIDS</code>).
              </p>
              <p>
                • <strong>Edit Tab Names &amp; Create New Tabs</strong>: You can rename any category tab (e.g. rename <code>WEDDINGS</code> to <code>PRE-WEDDINGS</code>) or create brand new tabs. Renaming a tab automatically updates all associated project photos!
              </p>
              <p>
                • <strong>Public 'ALL' Tab</strong>: On the public website, the <code>ALL</code> tab is always default, showing a balanced randomized mix of photos from all active category tabs.
              </p>
              <p>
                • <strong>Default Image Fallbacks</strong>: All 89 original portfolio photos from <code>public/assets/comperessed images/</code> are included out of the box and can never be deleted from disk.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => setActiveTab('projects')}
                className="bg-[#A85532] hover:bg-[#1c1917] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Manage Portfolio Categories &amp; Images →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CINEMATIC FILMS */}
      {activeTab === 'cinematic_films' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917] uppercase tracking-wide">
                  Cinematic Films Management
                </h3>
                <span className="px-3 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full font-mono text-xs font-bold">
                  {cinematicFilms.length} / 4 Containers Used
                </span>
              </div>
              <p className="text-stone-500 text-xs font-medium">
                Customize YouTube video URLs, cover photos, titles, and subtitles. You can add up to a <strong>maximum of 4 film containers</strong>.
              </p>
            </div>

            <button
              onClick={() => {
                if (cinematicFilms.length >= 4) {
                  alert('Maximum limit reached: You can add only up to 4 Cinematic Film containers.')
                  return
                }
                setShowAddFilmModal(true)
              }}
              disabled={cinematicFilms.length >= 4}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                cinematicFilms.length >= 4
                  ? 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
                  : 'bg-[#A85532] hover:bg-[#1c1917] text-white cursor-pointer'
              }`}
            >
              {cinematicFilms.length >= 4 ? 'Max 4 Containers Reached' : '+ Add Film Container'}
            </button>
          </div>

          <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-center justify-between text-xs text-sky-900 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <span>
                <strong>Constraint Notice:</strong> You can add a <strong>maximum of 4 Cinematic Film containers</strong>.
              </span>
            </div>
            <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-sky-200 text-sky-800">
              {4 - cinematicFilms.length} Slot(s) Remaining
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cinematicFilms.map((film) => {
              const coverUrl = film.custom_cover_url || film.default_cover_url || '/assets/image/services/Wedding.webp'
              const isCustomCover = Boolean(film.custom_cover_url)
              const ytId = extractYouTubeId(film.youtube_url)

              return (
                <div
                  key={film.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 ${
                    !film.is_active ? 'border-red-200 bg-red-50/20' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <span className="font-bold text-sm text-[#1c1917] font-['Manrope']">
                      {film.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        film.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {film.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="relative w-full h-48 bg-stone-900 rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center group">
                    <img
                      src={coverUrl}
                      alt={film.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#A85532] flex items-center justify-center text-white mb-2 shadow-lg">
                        ▶
                      </div>
                      <span className="text-white text-xs font-mono font-semibold bg-black/70 px-3 py-1 rounded-md">
                        YouTube ID: {ytId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 font-medium">
                    <p><strong>Subtitle:</strong> {film.subtitle || 'Punniyakotti Photography & Film Studio'}</p>
                    <p className="truncate"><strong>YouTube Link:</strong> <a href={film.youtube_url} target="_blank" rel="noreferrer" className="text-[#A85532] underline">{film.youtube_url}</a></p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
                    <label className="text-[10px] font-bold uppercase bg-[#A85532] hover:bg-[#1c1917] text-white px-3 py-2 rounded-xl cursor-pointer transition-colors shadow-xs">
                      {isCustomCover ? 'Replace Cover Image' : 'Upload Custom Cover'}
                      <input
                        type="file"
                        accept=".webp,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFilmCoverUpload(film.id, file)
                        }}
                      />
                    </label>

                    {isCustomCover && (
                      <button
                        onClick={() => resetFilmCover(film.id)}
                        className="text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200 cursor-pointer"
                      >
                        Reset Cover
                      </button>
                    )}

                    <button
                      onClick={() => setEditingFilm(film)}
                      className="text-[10px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl border border-stone-200 cursor-pointer"
                    >
                      Edit Link &amp; Text
                    </button>

                    <button
                      onClick={() => updateFilm(film.id, { is_active: !film.is_active })}
                      className={`text-[10px] font-semibold px-3 py-2 rounded-xl border cursor-pointer ${
                        film.is_active
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {film.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete container "${film.title}"?`)) {
                          await deleteFilm(film.id)
                        }
                      }}
                      className="text-[10px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION ASSET MANAGEMENT TABS */}
      {['about', 'services', 'video_drone', 'wedding_story', 'instagram'].includes(activeTab) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917] uppercase tracking-wide">
                {activeTab.replace('_', ' ')} Management
              </h3>
              <p className="text-stone-500 text-xs mt-1 font-medium">
                Change images (custom override), Reset to default, or Disable section items.
              </p>
            </div>
            <button
              onClick={() => refreshCMS()}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-3.5 py-2 border border-stone-200 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              🔄 Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTION_CONFIGS.filter((cfg) => cfg.tab === activeTab).map((cfg) => {
              const assetState = getSectionAsset(cfg.id, cfg.defaultSrc)
              return (
                <ImageUploader
                  key={cfg.id}
                  sectionId={cfg.id}
                  sectionName={cfg.name}
                  imagePurpose={cfg.purpose}
                  currentSrc={assetState.src}
                  isCustom={assetState.isCustom}
                  isDisabled={assetState.isDisabled}
                  folder={cfg.folder}
                  onSaveCustomUrl={(url) => updateSectionAsset(cfg.id, cfg.name, cfg.purpose, url)}
                  onResetToDefault={() => updateSectionAsset(cfg.id, cfg.name, cfg.purpose, null)}
                  onToggleDisabled={(disabled) =>
                    updateSectionAsset(cfg.id, cfg.name, cfg.purpose, assetState.isCustom ? assetState.src : null, disabled)
                  }
                />
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: PORTFOLIO / PROJECTS (ORGANIZED BY INDIVIDUAL CATEGORY TABS) */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917] uppercase tracking-wide">
                Portfolio Projects &amp; Gallery Archive
              </h3>
              <p className="text-stone-500 text-xs mt-1 font-medium">
                Manage individual category tabs, edit tab names, add new tabs, and upload/disable project photos.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddCatModal(true)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                + Add New Tab
              </button>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="bg-[#A85532] hover:bg-[#1c1917] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                + Add Photo To {selectedCategoryName}
              </button>
            </div>
          </div>

          {/* Individual Category Sub-Tabs with Drag & Drop Reordering (No "ALL" tab in admin) */}
          <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>✋ Drag &amp; Drop or use arrows to reorder tabs</span>
                <span className="text-stone-300">|</span>
                <span>Click a tab to select</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {categories.length} Category Tabs Total
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategoryName.toUpperCase() === cat.name.toUpperCase()
                const count = projects.filter((p) => p.category.toUpperCase() === cat.name.toUpperCase()).length
                const isDisabled = cat.is_active === false

                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedCatIndex(idx)
                      e.dataTransfer.setData('text/plain', String(idx))
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      const rawIndex = e.dataTransfer.getData('text/plain')
                      const fromIdx = draggedCatIndex !== null ? draggedCatIndex : (rawIndex !== '' ? parseInt(rawIndex, 10) : null)
                      setDraggedCatIndex(null)
                      if (fromIdx === null || isNaN(fromIdx) || fromIdx === idx) return
                      const newList = [...categories]
                      const [moved] = newList.splice(fromIdx, 1)
                      newList.splice(idx, 0, moved)
                      await reorderCategories(newList)
                    }}
                    className={`inline-flex items-center rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-[#A85532] text-white border-[#A85532] shadow-sm'
                        : isDisabled
                        ? 'bg-amber-50/60 text-stone-400 border-amber-200/80'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    {/* Drag Grip Handle */}
                    <span
                      className={`px-2 py-2 cursor-grab active:cursor-grabbing text-xs select-none ${
                        isSelected ? 'text-white/70' : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Drag to reorder tab position"
                    >
                      ⠿
                    </span>

                    {/* Category Tab Button */}
                    <button
                      onClick={() => setSelectedCategoryName(cat.name)}
                      className="py-2 pr-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      {isDisabled && <span className="text-[9px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">Off</span>}
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>

                    {/* Move Left / Right Buttons */}
                    <div className="flex items-center pr-1 gap-0.5">
                      {idx > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            const newList = [...categories]
                            const [moved] = newList.splice(idx, 1)
                            newList.splice(idx - 1, 0, moved)
                            await reorderCategories(newList)
                          }}
                          className={`p-1 rounded text-[10px] cursor-pointer ${
                            isSelected ? 'text-white/80 hover:bg-white/20' : 'text-stone-400 hover:bg-stone-200'
                          }`}
                          title="Move Left"
                        >
                          ←
                        </button>
                      )}
                      {idx < categories.length - 1 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            const newList = [...categories]
                            const [moved] = newList.splice(idx, 1)
                            newList.splice(idx + 1, 0, moved)
                            await reorderCategories(newList)
                          }}
                          className={`p-1 rounded text-[10px] cursor-pointer ${
                            isSelected ? 'text-white/80 hover:bg-white/20' : 'text-stone-400 hover:bg-stone-200'
                          }`}
                          title="Move Right"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Category Tab Actions Bar */}
            {(() => {
              const catObj = categories.find((c) => c.name.toUpperCase() === selectedCategoryName.toUpperCase())
              if (!catObj) return null

              const isDef = isDefaultCategory(catObj)
              const isDisabled = catObj.is_active === false

              return (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-700">
                      Tab Options for <span className="text-[#A85532]">{catObj.name}</span>:
                    </span>
                    {isDef ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
                        🔒 Default Category
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                        ✨ Custom Added Category
                      </span>
                    )}
                    {isDisabled && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        👁️ Hidden from Website
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Edit Tab Name */}
                    <button
                      onClick={() => {
                        setEditingCatId(catObj.id)
                        setEditingCatNameText(catObj.name)
                      }}
                      className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-200 transition-all cursor-pointer"
                      title="Edit current tab name"
                    >
                      ✏️ Edit Tab Name
                    </button>

                    {/* Enable / Disable Tab Toggle */}
                    <button
                      onClick={async () => {
                        await toggleCategoryActive(catObj.id)
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isDisabled
                          ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                      }`}
                      title={isDisabled ? 'Enable tab on website' : 'Disable tab on website'}
                    >
                      {isDisabled ? '👁️ Enable Tab' : '👁️ Disable Tab'}
                    </button>

                    {/* Delete Tab: Only allowed for Custom Tabs. Default tabs cannot be deleted. */}
                    {isDef ? (
                      <span
                        className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 cursor-not-allowed select-none"
                        title="Default category tabs (WEDDINGS, PREVIEW ALBUMN, BABY SHOWER, COUPLES, KIDS) cannot be deleted. You can disable them instead."
                      >
                        🔒 Default Tab (Cannot Delete)
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category tab "${catObj.name}"?`)) {
                            await deleteCategory(catObj.id)
                            const remaining = categories.filter((c) => c.id !== catObj.id)
                            if (remaining.length > 0) setSelectedCategoryName(remaining[0].name)
                          }
                        }}
                        className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer"
                        title="Delete custom tab"
                      >
                        🗑️ Delete Tab
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Current Category Projects Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Viewing photos in tab: <span className="text-[#A85532] font-extrabold">{selectedCategoryName}</span> ({currentCategoryProjects.length} photos)
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Tip: On public site, the 'ALL' tab automatically combines photos from all tabs.
              </span>
            </div>

            {currentCategoryProjects.length === 0 ? (
              <div className="p-12 text-center text-stone-500 space-y-3">
                <p className="text-sm font-medium">No photos found in tab "{selectedCategoryName}".</p>
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="bg-[#A85532] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  + Add First Photo to {selectedCategoryName}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-mono font-bold">
                      <th className="py-3.5 px-4">Preview</th>
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4">Category Tab</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Order</th>
                      <th className="py-3.5 px-4">Image State</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {currentCategoryProjects.map((proj) => {
                      const activeSrc = proj.custom_src || proj.default_src
                      const isCustom = Boolean(proj.custom_src)
                      const isDefault = DEFAULT_PROJECTS.some((def) => def.id === proj.id)

                      return (
                        <tr key={proj.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                              <img
                                src={activeSrc}
                                alt={proj.title}
                                className={`w-full h-full object-cover ${!proj.is_active ? 'grayscale opacity-60' : ''}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-900">
                            {proj.title}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 bg-[#A85532]/08 text-[#A85532] border border-[#A85532]/20 rounded-md font-mono text-[10px] tracking-wider uppercase font-bold">
                              {proj.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => updateProject(proj.id, { is_active: !proj.is_active })}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                proj.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                              }`}
                              title="Click to enable or disable image visibility on live site"
                            >
                              {proj.is_active ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-stone-600">
                            {proj.display_order}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                                isCustom
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }`}
                            >
                              {isCustom ? 'Custom Upload' : 'Default Asset'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <label className="inline-block text-[10px] font-bold uppercase bg-[#A85532] hover:bg-[#1c1917] text-white px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs">
                              Change Image
                              <input
                                type="file"
                                accept=".webp,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleProjectImageUpload(proj.id, file)
                                }}
                              />
                            </label>

                            {isCustom && (
                              <button
                                onClick={() => resetProjectImage(proj.id)}
                                className="text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 cursor-pointer transition-all"
                                title="Reset image to default"
                              >
                                Reset Default
                              </button>
                            )}

                            <button
                              onClick={() => setEditingProject(proj)}
                              className="text-[10px] font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 cursor-pointer transition-all"
                            >
                              Edit
                            </button>

                            {isDefault ? (
                              <button
                                onClick={() => updateProject(proj.id, { is_active: !proj.is_active })}
                                className="text-[10px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 cursor-pointer transition-all"
                                title="Disable/Hide default project from live site"
                              >
                                {proj.is_active ? 'Disable' : 'Enable'}
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete custom project "${proj.title}"?`)) {
                                    await deleteProject(proj.id)
                                  }
                                }}
                                className="text-[10px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 cursor-pointer transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD NEW CATEGORY TAB MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                Add New Category Tab
              </h4>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-stone-400 hover:text-stone-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-2">
                  1. Select Category Type
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setNewCatType('image')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      newCatType === 'image'
                        ? 'bg-[#A85532] text-white border-[#A85532] shadow-sm font-bold'
                        : 'bg-[#faf9f6] text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-xl">📷</span>
                    <span className="text-xs uppercase tracking-wider font-mono">Image Category</span>
                    <span className="text-[10px] opacity-80">Photo gallery tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCatType('video')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      newCatType === 'video'
                        ? 'bg-[#A85532] text-white border-[#A85532] shadow-sm font-bold'
                        : 'bg-[#faf9f6] text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-xl">🎥</span>
                    <span className="text-xs uppercase tracking-wider font-mono">Video Category</span>
                    <span className="text-[10px] opacity-80">YouTube video tab</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">
                  2. Tab Name (e.g. WEDDING REELS, CORPORATE, MATERNITY)
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={newCatType === 'video' ? 'e.g. WEDDING FILMS' : 'e.g. PRE WEDDING'}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 uppercase font-mono focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                >
                  Create Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY TAB NAME MODAL */}
      {editingCatId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                Rename Category Tab
              </h4>
              <button
                onClick={() => setEditingCatId(null)}
                className="text-stone-400 hover:text-stone-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">
                  New Tab Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCatNameText}
                  onChange={(e) => setEditingCatNameText(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 uppercase font-mono focus:outline-none focus:border-[#A85532]"
                />
                <p className="text-stone-400 text-[11px] mt-1.5 leading-relaxed">
                  Note: Renaming this tab will automatically update all existing photos under this category!
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingCatId(null)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                >
                  Save New Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW FILM CONTAINER MODAL */}
      {showAddFilmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                Add Cinematic Film Container
              </h4>
              <button
                onClick={() => setShowAddFilmModal(false)}
                className="text-stone-400 hover:text-stone-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFilm} className="space-y-4 text-xs">
              {filmError && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl font-medium">
                  ⚠️ {filmError}
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Film Title</label>
                <input
                  type="text"
                  required
                  value={newFilmTitle}
                  onChange={(e) => setNewFilmTitle(e.target.value)}
                  placeholder="e.g. Royal Palace Pre-Wedding Film"
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Subtitle / Studio Tag</label>
                <input
                  type="text"
                  value={newFilmSubtitle}
                  onChange={(e) => setNewFilmSubtitle(e.target.value)}
                  placeholder="e.g. Punniyakotti Photography & Film Studio"
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">YouTube Video Link / URL</label>
                <input
                  type="text"
                  required
                  value={newFilmYtUrl}
                  onChange={(e) => setNewFilmYtUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=b68HETiNO98"
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Upload Cover Image (Optional)</label>
                <input
                  type="file"
                  accept=".webp,.jpg,.jpeg,.png"
                  onChange={(e) => setNewFilmFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-2.5 text-stone-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddFilmModal(false)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingFilm}
                  className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                >
                  {addingFilm ? 'Adding...' : 'Create Film Container'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FILM MODAL */}
      {editingFilm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                Edit Cinematic Film Details
              </h4>
              <button
                onClick={() => setEditingFilm(null)}
                className="text-stone-400 hover:text-stone-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFilmEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Film Title</label>
                <input
                  type="text"
                  value={editingFilm.title}
                  onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Subtitle / Studio Tag</label>
                <input
                  type="text"
                  value={editingFilm.subtitle || ''}
                  onChange={(e) => setEditingFilm({ ...editingFilm, subtitle: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">YouTube Video URL</label>
                <input
                  type="text"
                  value={editingFilm.youtube_url}
                  onChange={(e) => setEditingFilm({ ...editingFilm, youtube_url: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="film-edit-active"
                  checked={editingFilm.is_active}
                  onChange={(e) => setEditingFilm({ ...editingFilm, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#A85532] rounded focus:ring-0"
                />
                <label htmlFor="film-edit-active" className="text-stone-700 font-semibold">Visible on website (Active)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingFilm(null)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingFilm}
                  className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PROJECT / VIDEO MODAL */}
      {showAddProjectModal && (() => {
        const currentCatObj = categories.find((c) => c.name.toUpperCase() === selectedCategoryName.toUpperCase())
        const isVideoTab = currentCatObj?.type === 'video'

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                    {isVideoTab ? `Add Video to ${selectedCategoryName}` : `Add Photo to ${selectedCategoryName}`}
                  </h4>
                  <p className="text-stone-400 text-xs font-mono mt-0.5">
                    {isVideoTab ? '🎥 Video Collection Item' : '📷 Photo Gallery Item'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProjectModal(false)}
                  className="text-stone-400 hover:text-stone-800 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4 text-xs">
                {projectError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl font-medium">
                    ⚠️ {projectError}
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">
                    {isVideoTab ? 'Video Title' : 'Photo Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isVideoTab ? 'e.g. Swetha & Rahul Pre-Wedding Teaser' : 'e.g. Royal Heritage Frame'}
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Target Category Tab</label>
                  <select
                    value={selectedCategoryName}
                    onChange={(e) => setSelectedCategoryName(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.type === 'video' ? '🎥 Video' : '📷 Image'})
                      </option>
                    ))}
                  </select>
                </div>

                {isVideoTab && (
                  <div>
                    <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">
                      YouTube Video Link / URL
                    </label>
                    <input
                      type="text"
                      required
                      value={newYtUrl}
                      onChange={(e) => setNewYtUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=b68HETiNO98"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">
                    {isVideoTab ? 'Upload Cover Image (Thumbnail)' : 'Upload Photo'}
                  </label>
                  <input
                    type="file"
                    accept=".webp,.jpg,.jpeg,.png"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-2.5 text-stone-700"
                  />
                  {isVideoTab && (
                    <p className="text-stone-400 text-[11px] mt-1">
                      This cover image will be displayed on the gallery card with a Play button overlay!
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                    className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingProject}
                    className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                  >
                    {addingProject ? 'Adding...' : isVideoTab ? 'Create Video Item' : 'Create Photo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#1c1917]">
                Edit Photo Information
              </h4>
              <button
                onClick={() => setEditingProject(null)}
                className="text-stone-400 hover:text-stone-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProjectEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Category Tab</label>
                <select
                  value={editingProject.category}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase tracking-wider mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingProject.display_order}
                  onChange={(e) => setEditingProject({ ...editingProject, display_order: Number(e.target.value) })}
                  className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#A85532]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingProject.is_active}
                  onChange={(e) => setEditingProject({ ...editingProject, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#A85532] rounded focus:ring-0"
                />
                <label htmlFor="edit-active" className="text-stone-700 font-semibold">Visible on website (Active)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProject}
                  className="bg-[#A85532] text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#1c1917] transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
