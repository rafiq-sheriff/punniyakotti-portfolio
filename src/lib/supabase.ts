import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cegucaqfhcvyijrsdqvb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ3VjYXFmaGN2eWlqcnNkcXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTU5MDMsImV4cCI6MjEwNTE5MTkwM30.GqCpdR-0KfFUjZTpyYDqAXp2a01hBdE6SvvUUMtsc80'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SiteSectionAsset {
  section_id: string
  section_name: string
  image_purpose?: string
  custom_image_url?: string | null
  is_disabled?: boolean
  updated_at?: string
}

export interface CMSProject {
  id: string
  title: string
  category: string
  default_src: string
  custom_src?: string | null
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ProjectCategory {
  id: string
  name: string
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface CinematicFilm {
  id: string
  title: string
  subtitle?: string
  youtube_url: string
  default_cover_url?: string
  custom_cover_url?: string | null
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export function extractYouTubeId(url: string): string {
  if (!url) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.trim().match(regExp)
  return match && match[2].length === 11 ? match[2] : url.trim()
}

export async function uploadWebsiteAsset(file: File, folder: string = 'general'): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'webp'
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('website-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from('website-assets')
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}
