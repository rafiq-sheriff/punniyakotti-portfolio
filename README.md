# Puniyakotti — Luxury Wedding Photography & Film Studio

![Puniyakotti Photography & Film Studio Banner](./assets/image/hero.png)

A luxury, high-end editorial web application built for **Punniyakotti Studio**, specializing in luxury wedding photography, destination weddings, baby showers, couple portraits, and cinematic films.

---

## ✨ Features & Highlights

- 📸 **Interactive 360° Sprite & Video Hero**: Dynamic interactive canvas hero with smooth 60fps frame interpolation and liquid distortion typography.
- 🌊 **Distorted WebGL Fluid Typography**: Custom WebGL interactive fluid typography headers responding organically to cursor movement.
- 🎬 **Cinematic Showreel & Video Vault**: Embedded YouTube cinematic wedding films with custom cover overlays and fullscreen modal video player.
- 🖼️ **Editorial Gallery Portfolio**: Category-filtered image showcase (`Weddings`, `Babyshower`, `Couples`, `Kids`, `Preview Album`).
- 💬 **Interactive Contact & Inquiry Form**: Direct booking inquiry form backed by Supabase with instant pre-filled WhatsApp chat redirection.
- 🔒 **Admin CMS Dashboard**: Built-in visual content manager for updating photography assets, hero sprites, gallery items, and testimonials.
- 📱 **Social Sharing Preview**: Complete Open Graph (`og:image`) & Twitter Card metadata setup for rich preview image cards when shared on WhatsApp, Instagram, iMessage, and Twitter.
- ⚡ **Vercel Production Ready**: Optimized SPA build configuration with sub-second page transitions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 + React DOM 19 |
| **Language** | TypeScript 5.7 |
| **Build Tool** | Vite 8 + `@tailwindcss/vite` |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL + RLS) |
| **Deployment** | Vercel (One-Click SPA Routing) |

---

## 📁 Project Structure

```
puniyakotti-portfolio/
├── assets/
│   └── image/
│       └── hero.png              # Primary Hero & Social Preview Image
├── public/
│   ├── og-image.png              # Social Media Preview Image (WhatsApp, Facebook, Twitter)
│   ├── assets/                   # Public Static Assets & Gallery Images
│   └── hero-sprites/             # 120-frame 30fps Ultra HD WebP Sprite Sheets
├── src/
│   ├── admin/                    # CMS Admin Dashboard & Management UI
│   ├── components/               # Decoupled UI Components
│   │   ├── ContactForm.tsx       # Booking & Inquiry Form
│   │   ├── DistortedTypography.tsx# WebGL Liquid Distortion Header
│   │   ├── HeroAnimation.tsx     # Canvas Interactive Hero Wrapper
│   │   ├── InteractiveHero.tsx   # 360° Pointer-Tracking Canvas Engine
│   │   ├── Preloader.tsx        # High-End Motion Preloader
│   │   └── ProjectsPage.tsx     # Full Gallery Portfolio Page
│   ├── context/
│   │   └── CMSContext.tsx        # Global CMS State Provider
│   ├── lib/
│   │   └── supabase.ts           # Supabase Client & Database Helpers
│   ├── App.tsx                   # Main Application Shell
│   ├── index.css                 # Tailwind CSS v4 Setup & Global Utility Classes
│   └── main.tsx                  # React Entrypoint
├── index.html                    # HTML Shell with Open Graph Meta Tags & Fonts
├── vite.config.ts                # Production Vite Configuration
└── vercel.json                   # Vercel SPA Rewrite Rules
```

---

## 🚀 Quick Start & Development Guide

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `pnpm` (recommended)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rafiq-sheriff/punniyakotti-portfolio.git
cd punniyakotti-portfolio
pnpm install
```

### 2. Run Development Server

Start the local dev server at `http://localhost:3000`:

```bash
pnpm run dev
```

### 3. Production Build

Test the production bundle locally:

```bash
pnpm run build
```

---

## 📲 Social Media Preview Setup (WhatsApp / Facebook / Twitter)

This project is configured with full **Open Graph (`og:image`)** and **Twitter Card (`summary_large_image`)** metadata in [`index.html`](./index.html).

When you share your website link (e.g. `https://punniyakotti-portfolio.vercel.app`) on **WhatsApp**, **Instagram**, **iMessage**, **Twitter**, **Facebook**, or **LinkedIn**, social platforms automatically generate a rich preview card displaying the high-resolution Hero banner image (`public/og-image.png`).

---

## 🌐 Deploying to Vercel

1. Push your changes to GitHub or your Git repository provider.
2. Connect your repository to [Vercel](https://vercel.com).
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

© 2026 **Punniyakotti Photography & Films**. All Rights Reserved.
