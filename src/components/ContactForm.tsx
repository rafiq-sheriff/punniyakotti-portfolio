import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Share2,
  RefreshCw,
} from 'lucide-react'
import { submitContactInquiry, type ContactInquiry } from '../lib/supabase'

interface ContactFormProps {
  theme?: 'dark' | 'light'
  onSuccess?: () => void
}

const SERVICE_OPTIONS = [
  'Wedding Photography',
  'Wedding Films / Cinematic',
  'Pre-Wedding Shoot',
  'Engagement / Reception',
  'Event Coverage',
  'Portrait / Brand Story',
  'Baby & Family Photography',
  'Other / Custom Requirement',
]

const BUDGET_OPTIONS = [
  'Select Budget Range (Optional)',
  'Under ₹50,000',
  '₹50,000 - ₹1,00,000',
  '₹1,00,000 - ₹2,50,000',
  '₹2,50,000+',
  'Flexible / Open to Discussion',
]

const REFERRAL_OPTIONS = [
  'How did you hear about us?',
  'Instagram',
  'Google Search',
  'Friend or Family Recommendation',
  'YouTube',
  'Previous Client',
  'Other',
]

export default function ContactForm({ theme = 'dark', onSuccess }: ContactFormProps) {
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'Wedding Photography',
    event_date: '',
    event_location: '',
    budget_range: '',
    referral_source: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedInquiry, setSubmittedInquiry] = useState<ContactInquiry | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone / WhatsApp number is required'
    } else if (formData.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid phone number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await submitContactInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service_type: formData.service_type,
        event_date: formData.event_date.trim() || undefined,
        event_location: formData.event_location.trim() || undefined,
        budget_range: formData.budget_range && !formData.budget_range.startsWith('Select') ? formData.budget_range : undefined,
        referral_source: formData.referral_source && !formData.referral_source.startsWith('How') ? formData.referral_source : undefined,
        message: formData.message.trim() || undefined,
      })

      setSubmittedInquiry(result)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Something went wrong while submitting. Please try again or reach us via WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      service_type: 'Wedding Photography',
      event_date: '',
      event_location: '',
      budget_range: '',
      referral_source: '',
      message: '',
    })
    setSubmittedInquiry(null)
    setErrorMessage(null)
    setErrors({})
  }

  // WhatsApp Pre-filled message generator
  const getWhatsAppUrl = () => {
    const text = `Hello Punniyakotti Photography!%0A%0AI just submitted an inquiry on your website.%0A%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Service:* ${encodeURIComponent(formData.service_type)}${formData.event_date ? `%0A*Date:* ${encodeURIComponent(formData.event_date)}` : ''}${formData.event_location ? `%0A*Location:* ${encodeURIComponent(formData.event_location)}` : ''}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A%0ALooking forward to connecting with you!`
    return `https://wa.me/917708665274?text=${text}`
  }

  if (submittedInquiry) {
    return (
      <div
        className={`w-full rounded-2xl p-8 lg:p-12 text-center border backdrop-blur-md transition-all duration-500 ${
          isDark
            ? 'bg-[#12110e]/80 border-[#D07A55]/30 text-[#f2ece0]'
            : 'bg-white/90 border-[#A85532]/20 text-[#1c1917]'
        }`}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-gradient-to-tr from-[#D07A55]/20 to-[#A85532]/30 text-[#D07A55] border border-[#D07A55]/40 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <p className={`text-xs font-['Manrope'] tracking-[0.3em] uppercase font-semibold mb-3 ${isDark ? 'text-[#D07A55]' : 'text-[#A85532]'}`}>
          Inquiry Received
        </p>

        <h3 className="font-['Cormorant_Garamond'] text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
          Thank You, {formData.name.split(' ')[0]}!
        </h3>

        <p className={`text-sm max-w-md mx-auto leading-relaxed mb-8 ${isDark ? 'text-[#f2ece0]/70' : 'text-[#1c1917]/70'}`}>
          We have safely received your inquiry regarding <span className="font-semibold text-[#D07A55]">{formData.service_type}</span>. Our team will review your details and get back to you within 24 hours.
        </p>

        <div className={`p-4 rounded-xl max-w-md mx-auto mb-8 border text-left text-xs space-y-2 ${isDark ? 'bg-[#080706]/70 border-[#f2ece0]/10' : 'bg-stone-50 border-stone-200'}`}>
          <div className="flex justify-between items-center text-xs opacity-75 font-mono border-b pb-2 border-dashed border-current/10">
            <span>Reference ID</span>
            <span className="font-semibold text-[#D07A55]">#{submittedInquiry.id ? submittedInquiry.id.slice(0, 8).toUpperCase() : 'SUBMITTED'}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60">Selected Service:</span>
            <span className="font-medium">{formData.service_type}</span>
          </div>
          {formData.event_date && (
            <div className="flex justify-between">
              <span className="opacity-60">Target Date:</span>
              <span className="font-medium">{formData.event_date}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="opacity-60">Contact Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-['Manrope'] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-[#25D366]/20"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 800 800">
              <path d="M571 474.5C561.5 470 516 447.5 507.5 444C499 440.5 493 439.5 486.5 449C480 458.5 462.5 479 457 485.5C451.5 492 446.5 492.5 437 485.5C409.713 474.55 384.513 458.99 362.5 439.5C342.572 420.738 325.702 398.975 312.5 375C307 366 312.5 361 316.5 356C320.5 351 325.5 345.5 330.5 340C334.156 335.243 337.181 330.033 339.5 324.5C340.74 321.927 341.384 319.107 341.384 316.25C341.384 313.393 340.74 310.573 339.5 308C339.5 303.5 318.5 258 310.5 239.5C302.5 221 295.5 223.5 290 223.5H270C260.472 223.871 251.481 228.007 245 235C234.537 244.983 226.25 257.021 220.658 270.357C215.065 283.693 212.288 298.04 212.5 312.5C215.057 347.999 228.11 381.936 250 410C290.168 469.672 345.123 517.908 409.5 550C431.5 559.5 448.5 565 462 569.5C480.957 575.23 500.994 576.429 520.5 573C533.454 570.372 545.731 565.11 556.568 557.541C567.405 549.972 576.572 540.258 583.5 529C589.265 515.097 591.165 499.894 589 485C586.5 481.5 580.5 479 571 474.5Z" />
              <path d="M664.5 134C629.921 99.0942 588.703 71.4663 543.275 52.7457C497.848 34.0252 449.132 24.5912 400 25C334.915 25.3406 271.058 42.7517 214.807 75.4941C158.556 108.237 111.881 155.165 79.4419 211.591C47.0031 268.017 29.9365 331.967 29.9467 397.053C29.9569 462.139 47.0435 526.084 79.5 582.5L29.5 775L226.5 725C280.962 754.635 341.997 770.109 404 770H400C473.896 770.482 546.261 748.944 607.867 708.132C669.473 667.321 717.528 609.087 745.904 540.855C774.281 472.623 781.692 397.485 767.194 325.024C752.696 252.563 716.945 186.061 664.5 134ZM400 706C344.528 706.044 290.087 691.008 242.5 662.5L231.5 656L114.5 686.5L145.5 572.5L138.5 561C98.5678 496.692 83.6306 419.963 96.5224 345.371C109.414 270.779 149.238 203.514 208.438 156.339C267.638 109.164 342.096 85.361 417.683 89.4459C493.27 93.5309 564.729 125.22 618.5 178.5C647.327 207.095 670.175 241.14 685.712 278.654C701.25 316.167 709.166 356.397 709 397C708.868 478.911 676.27 557.43 618.35 615.35C560.43 673.27 481.911 705.868 400 706Z" />
            </svg>
            <span>Connect via WhatsApp Now</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-['Manrope'] text-xs font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
              isDark
                ? 'border-[#f2ece0]/20 text-[#f2ece0]/80 hover:border-[#D07A55] hover:text-[#D07A55]'
                : 'border-stone-300 text-stone-700 hover:border-[#A85532] hover:text-[#A85532]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Send Another Inquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`w-full rounded-2xl p-6 sm:p-8 lg:p-10 border backdrop-blur-md transition-all duration-500 relative ${
        isDark
          ? 'bg-[#100f0c]/90 border-[#f2ece0]/10 text-[#f2ece0]'
          : 'bg-white/95 border-stone-200 text-[#1c1917]'
      }`}
    >
      <div className="mb-8">
        <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold tracking-tight">
          Tell Us About Your Vision
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#f2ece0]/60' : 'text-[#1c1917]/60'}`}>
          Fill out the details below and we will get back to you with custom packages & dates.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Submission Error</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Row 1: Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Full Name <span className="text-[#D07A55]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ananya & Karthik"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border ${
                  errors.name
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
                }`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Phone / WhatsApp <span className="text-[#D07A55]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-40">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border ${
                  errors.phone
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.phone}</p>}
          </div>
        </div>

        {/* Row 2: Email & Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email Address */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Email Address <span className="text-[#D07A55]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border ${
                  errors.email
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
                }`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Service Interested In */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Service Needed
            </label>
            <div className="relative">
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border cursor-pointer appearance-none ${
                  isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55]'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532]'
                }`}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className={isDark ? 'bg-[#100f0c] text-[#f2ece0]' : 'bg-white text-stone-900'}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-40">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Event Date & Event Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Event Date */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Event Date / Timeline
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-40">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                placeholder="e.g. 15th Nov 2026 / Tentative"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border ${
                  isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
                }`}
              />
            </div>
          </div>

          {/* Event Location */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Location / Venue
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-40">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="event_location"
                value={formData.event_location}
                onChange={handleChange}
                placeholder="e.g. Chennai / Destination"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border ${
                  isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Budget Range & Referral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Budget Range */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              Budget Estimate
            </label>
            <div className="relative">
              <select
                name="budget_range"
                value={formData.budget_range}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border cursor-pointer appearance-none ${
                  isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55]'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532]'
                }`}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className={isDark ? 'bg-[#100f0c] text-[#f2ece0]' : 'bg-white text-stone-900'}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-40">
                ▼
              </div>
            </div>
          </div>

          {/* Referral Source */}
          <div>
            <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
              How Did You Find Us?
            </label>
            <div className="relative">
              <select
                name="referral_source"
                value={formData.referral_source}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border cursor-pointer appearance-none ${
                  isDark
                    ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55]'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532]'
                }`}
              >
                {REFERRAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className={isDark ? 'bg-[#100f0c] text-[#f2ece0]' : 'bg-white text-stone-900'}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-40">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Message / Details */}
        <div>
          <label className={`block text-[11px] font-['Manrope'] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-[#f2ece0]/80' : 'text-stone-700'}`}>
            Your Story & Event Details
          </label>
          <div className="relative">
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your event theme, specific requirements, schedule, or questions..."
              className={`w-full px-4 py-3 rounded-xl text-xs transition-all duration-300 outline-none border resize-none ${
                isDark
                  ? 'bg-[#080706]/70 border-[#f2ece0]/15 text-[#f2ece0] focus:border-[#D07A55] focus:ring-2 focus:ring-[#D07A55]/20'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#A85532] focus:ring-2 focus:ring-[#A85532]/20'
              }`}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-8 rounded-xl font-['Manrope'] text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
            isSubmitting
              ? 'opacity-70 cursor-not-allowed bg-stone-600 text-white'
              : isDark
              ? 'bg-gradient-to-r from-[#D07A55] to-[#c06b47] text-[#0c0b09] hover:brightness-110 hover:shadow-[#D07A55]/30'
              : 'bg-gradient-to-r from-[#A85532] to-[#8d4325] text-white hover:brightness-110 hover:shadow-[#A85532]/30'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Availability Request</span>
            </>
          )}
        </button>

        <p className={`text-[10px] text-center mt-3 font-medium opacity-60 ${isDark ? 'text-[#f2ece0]' : 'text-stone-600'}`}>
          🔒 We respect your privacy. Your information is strictly used for booking inquiry purposes.
        </p>
      </div>
    </form>
  )
}
