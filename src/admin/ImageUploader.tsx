import React, { useState, useRef } from 'react'
import { uploadWebsiteAsset } from '../lib/supabase'

interface ImageUploaderProps {
  sectionId: string
  sectionName: string
  imagePurpose: string
  currentSrc: string
  isCustom: boolean
  isDisabled?: boolean
  folder?: string
  onSaveCustomUrl: (url: string) => Promise<void>
  onResetToDefault: () => Promise<void>
  onToggleDisabled?: (disabled: boolean) => Promise<void>
}

export default function ImageUploader({
  sectionId,
  sectionName,
  imagePurpose,
  currentSrc,
  isCustom,
  isDisabled = false,
  folder = 'general',
  onSaveCustomUrl,
  onResetToDefault,
  onToggleDisabled,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png']
  const maxSizeBytes = 5 * 1024 * 1024 // 5 MB

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    setSuccessMsg(null)

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please upload a .webp, .jpg, .jpeg, or .png file.')
      return
    }

    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Please choose a smaller image.`)
      return
    }

    try {
      setUploading(true)
      setProgress(30)

      const publicUrl = await uploadWebsiteAsset(file, folder)
      setProgress(80)

      await onSaveCustomUrl(publicUrl)
      setProgress(100)
      setSuccessMsg('Image updated successfully!')

      setTimeout(() => {
        setProgress(null)
        setSuccessMsg(null)
      }, 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleReset = async () => {
    if (!window.confirm(`Reset "${sectionName}" to original default image?`)) return
    try {
      setUploading(true)
      await onResetToDefault()
      setSuccessMsg('Reset to default image.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset image.')
    } finally {
      setUploading(false)
    }
  }

  const handleDisableToggle = async () => {
    if (!onToggleDisabled) return
    try {
      setUploading(true)
      await onToggleDisabled(!isDisabled)
      setSuccessMsg(isDisabled ? 'Section enabled.' : 'Section disabled.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change state.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4 ${
        isDisabled ? 'border-amber-200 bg-amber-50/30 opacity-75' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A85532] px-2.5 py-1 bg-[#A85532]/08 border border-[#A85532]/20 rounded-lg">
            {sectionId}
          </span>
          <div className="flex items-center gap-2">
            {isDisabled ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                Disabled / Hidden
              </span>
            ) : isCustom ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Custom Override
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                Default Asset
              </span>
            )}
          </div>
        </div>

        <h4 className="font-semibold text-stone-900 text-base mb-1 font-['Manrope']">{sectionName}</h4>
        <p className="text-stone-500 text-xs mb-4 leading-relaxed">{imagePurpose}</p>

        {/* Image Preview Container */}
        <div className="relative w-full h-44 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center group shadow-inner">
          <img
            src={currentSrc}
            alt={sectionName}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isDisabled ? 'grayscale brightness-75' : ''
            }`}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/assets/image/hero/hero.webp'
            }}
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-white text-xs font-medium bg-black/75 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md">
              Click Upload to Replace
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Alert Messages */}
      {progress !== null && (
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
          <div
            className="bg-[#A85532] h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-red-700 text-xs bg-red-50 border border-red-200 p-2.5 rounded-lg leading-relaxed font-medium">
          ⚠️ {errorMsg}
        </p>
      )}

      {successMsg && (
        <p className="text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-medium">
          ✓ {successMsg}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
        <input
          ref={fileInputRef}
          type="file"
          accept=".webp,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
          id={`file-input-${sectionId}`}
        />
        <label
          htmlFor={`file-input-${sectionId}`}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer transition-all ${
            uploading
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#A85532] hover:bg-[#1c1917] text-white shadow-sm'
          }`}
        >
          {uploading ? 'Uploading...' : isCustom ? 'Replace Image' : 'Change Image'}
        </label>

        {isCustom && (
          <button
            type="button"
            onClick={handleReset}
            disabled={uploading}
            className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Reset custom image to default local asset"
          >
            Reset Default
          </button>
        )}

        {onToggleDisabled && (
          <button
            type="button"
            onClick={handleDisableToggle}
            disabled={uploading}
            className={`text-xs font-semibold uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all cursor-pointer border ${
              isDisabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
            }`}
            title={isDisabled ? 'Enable section on website' : 'Disable / Hide section'}
          >
            {isDisabled ? 'Enable' : 'Disable'}
          </button>
        )}
      </div>
    </div>
  )
}
