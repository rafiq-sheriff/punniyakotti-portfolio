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
  type?: 'image' | 'video'
  youtube_url?: string | null
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ProjectCategory {
  id: string
  name: string
  display_order: number
  type?: 'image' | 'video'
  is_active?: boolean
  is_default?: boolean
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

export interface ContactInquiry {
  id?: string
  name: string
  email: string
  phone: string
  service_type?: string
  event_date?: string
  event_location?: string
  budget_range?: string
  referral_source?: string
  message?: string
  status?: 'new' | 'contacted' | 'booked' | 'archived'
  created_at?: string
}

export async function submitContactInquiry(inquiry: Omit<ContactInquiry, 'id' | 'created_at' | 'status'>): Promise<ContactInquiry> {
  const payload = {
    ...inquiry,
    status: 'new',
  }
  const { data, error } = await supabase
    .from('contact_inquiries')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('Error submitting contact inquiry to Supabase:', error)
    throw new Error(error.message || 'Failed to submit inquiry')
  }

  return data
}

export async function fetchContactInquiries(): Promise<ContactInquiry[]> {
  const { data, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact inquiries:', error)
    return []
  }

  return data || []
}

export async function updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'booked' | 'archived'): Promise<boolean> {
  const { error } = await supabase
    .from('contact_inquiries')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating inquiry status:', error)
    return false
  }

  return true
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('contact_inquiries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting inquiry:', error)
    alert(`Failed to delete from database: ${error.message}`)
    return false
  }

  return true
}

