# Puniyakotti Photography Portfolio

React + Vite + Tailwind CSS v4 luxury photography portfolio web application ready for Vercel deployment.

## Development Server

Run the development server using:

```bash
pnpm run dev
```

- Local URL: http://localhost:3000
- Hot reload: Changes to source files are reflected immediately

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` - Primary application component containing portfolio sections and state
- `src/components/` - Decoupled components (`InteractiveHero`, `ProjectsPage`, `Preloader`, `DistortedTypography`, `HeroAnimation`)
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 setup
- `index.html` - HTML shell with SEO meta tags, fonts, and root container
- `package.json` - Dependencies and build scripts
- `vite.config.ts` - Production Vite configuration with React, Tailwind CSS v4, and `@` path alias
- `vercel.json` - Vercel SPA routing rewrite configuration

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`)
- Build tooling: Vite 8, TypeScript 5.7

## Deployment

This application is configured for one-click deployment on **Vercel**:
1. Connect your repository to Vercel.
2. Build Command: `pnpm run build`
3. Output Directory: `dist`
