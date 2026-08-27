import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react'

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=85`

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  style = {},
  delay = 0,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── NAV ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(12,11,9,0.97)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(242,236,224,0.07)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div
        className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between"
        style={{ height: 72 }}
      >
        <a href="#" className="font-['DM_Serif_Display'] text-xl tracking-[0.22em] uppercase text-[#f2ece0]">
          Frame&nbsp;&amp;&nbsp;Soul
        </a>

        <div className="hidden lg:flex items-center gap-9">
          {['Home', 'Portfolio', 'Services', 'About', 'Stories', 'Contact'].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[11px] tracking-[0.18em] uppercase text-[#f2ece0]/60 hover:text-[#f2ece0] transition-colors duration-300"
            >
              {l}
            </a>
          ))}
        </div>

        <a
          href="#"
          className="hidden lg:block text-[11px] tracking-[0.18em] uppercase px-6 py-3 border border-[#b8965a] text-[#b8965a] hover:bg-[#b8965a] hover:text-[#0c0b09] transition-all duration-350"
        >
          Book a Session
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden flex flex-col gap-[5px] p-2 text-[#f2ece0]"
          aria-label="Menu"
        >
          <span
            className="block w-6 h-px bg-current origin-center transition-all duration-300"
            style={{ transform: open ? 'rotate(45deg) translateY(6px)' : undefined }}
          />
          <span
            className="block w-6 h-px bg-current transition-all duration-300"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="block w-6 h-px bg-current origin-center transition-all duration-300"
            style={{ transform: open ? 'rotate(-45deg) translateY(-6px)' : undefined }}
          />
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-[#0c0b09] px-8 pb-8 pt-2 flex flex-col gap-5 border-t border-[#f2ece0]/07">
          {['Home', 'Portfolio', 'Services', 'About', 'Stories', 'Contact'].map((l) => (
            <a key={l} href="#" className="text-sm tracking-[0.18em] uppercase text-[#f2ece0]/60">
              {l}
            </a>
          ))}
          <a
            href="#"
            className="self-start text-[11px] tracking-[0.18em] uppercase px-6 py-3 border border-[#b8965a] text-[#b8965a]"
          >
            Book a Session
          </a>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDrop {
          0%   { top: -40%; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { top: 140%; opacity: 0; }
        }
      `}</style>
    </nav>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100svh', minHeight: 680 }}>
      <img
        src={unsplash('1727430256509-0f897d6f4765', 1920, 1080)}
        alt="Indian bride and groom standing under an arch of flowers"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.45)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(12,11,9,0.55) 0%, rgba(12,11,9,0.1) 55%, rgba(12,11,9,0.7) 100%)',
        }}
      />

      <div className="relative z-10 h-full flex items-center max-w-[1440px] mx-auto px-8 lg:px-24">
        <div className="max-w-3xl">
          <p
            className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-7"
            style={{ animation: 'fadeUp 0.85s ease 0.25s both' }}
          >
            Photography &amp; Videography Studio — Est. 2016
          </p>
          <h1
            className="font-['DM_Serif_Display'] leading-[0.95] text-[#f2ece0] mb-9"
            style={{
              fontSize: 'clamp(3rem, 7vw, 7rem)',
              animation: 'fadeUp 0.9s ease 0.45s both',
            }}
          >
            We Capture<br />Moments That<br />Last Forever.
          </h1>
          <p
            className="text-sm text-[#f2ece0]/65 max-w-[420px] leading-[1.85] mb-12 tracking-wide"
            style={{ animation: 'fadeUp 0.9s ease 0.65s both' }}
          >
            Photography, films, and aerial storytelling for weddings, events, brands, and unforgettable moments.
          </p>
          <div
            className="flex flex-wrap gap-4"
            style={{ animation: 'fadeUp 0.9s ease 0.85s both' }}
          >
            <a
              href="#"
              className="text-[11px] tracking-[0.22em] uppercase px-9 py-4 bg-[#f2ece0] text-[#0c0b09] font-medium hover:bg-[#b8965a] hover:text-[#f2ece0] transition-all duration-350"
            >
              Explore Our Work
            </a>
            <a
              href="#"
              className="text-[11px] tracking-[0.22em] uppercase px-9 py-4 border border-[#f2ece0]/35 text-[#f2ece0] hover:border-[#f2ece0] transition-all duration-350"
            >
              Book Your Date
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: 'fadeUp 0.9s ease 1.1s both' }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#f2ece0]/40">Scroll</span>
        <div className="w-px h-12 bg-[#f2ece0]/20 relative overflow-hidden">
          <div
            className="absolute left-0 w-full bg-[#b8965a]"
            style={{ height: '45%', animation: 'scrollDrop 1.6s ease infinite' }}
          />
        </div>
      </div>
    </section>
  )
}

// ─── STUDIO STATEMENT ────────────────────────────────────────────────────────
function StudioStatement() {
  return (
    <section className="py-28 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 grid lg:grid-cols-[1fr_1.15fr] gap-16 lg:gap-28 items-center">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-9">The Studio</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.08] mb-9"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}
          >
            Your Moments.<br />Our Perspective.
          </h2>
          <p className="text-sm text-[#f2ece0]/55 leading-[1.95] max-w-[400px] mb-11">
            We capture authentic emotions, atmosphere, intimate details, and the people who make every event unforgettable. Through photography, cinematic films, and aerial cinematography, we transform fleeting moments into timeless stories.
          </p>
          <a
            href="#"
            className="text-[11px] tracking-[0.22em] uppercase text-[#b8965a] inline-flex items-center gap-3 border-b border-[#b8965a]/35 pb-1 hover:border-[#b8965a] transition-colors duration-300"
          >
            Our Story <span>→</span>
          </a>
        </Reveal>

        <Reveal delay={180}>
          <div className="relative">
            <img
              src={unsplash('1665960213508-48f07086d49c', 760, 960)}
              alt="Indian couple in traditional attire"
              className="w-full object-cover"
              style={{ aspectRatio: '4/5' }}
            />
            <div className="absolute -bottom-7 -left-7 w-44 h-56 overflow-hidden border-[5px] border-[#0c0b09]">
              <img
                src={unsplash('1611106211090-8f3c79eb8552', 280, 360)}
                alt="Bride in green and gold sari"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
const SERVICES = [
  { title: 'Wedding Photography', desc: 'Every emotion, every glance — preserved in frames that outlast time.', img: '1735052712464-9d24b69be5f5' },
  { title: 'Wedding Films', desc: 'Cinematic wedding films that relive your love story with every viewing.', img: '1519741196428-6a2175fa2557' },
  { title: 'Corporate & Business Events', desc: 'Professional photography that communicates authority and excellence.', img: '1772690445981-78b22eacda4b' },
  { title: 'Event Photography', desc: 'From concerts to cultural celebrations — we document the energy.', img: '1764255510960-deee566a91f0' },
  { title: 'Event Videography', desc: 'High-production highlight reels for every event, large or intimate.', img: '1768508947605-8c7a50aed683' },
  { title: 'Drone & Aerial Cinematography', desc: 'Sweeping aerial perspectives that transform how your story is told.', img: '1767050248602-26b7386901ce' },
  { title: 'Pre-Wedding Photography', desc: 'Editorial pre-wedding shoots that tell your story before the ceremony.', img: '1633104502699-b2ecf0fee294' },
  { title: 'Brand & Commercial', desc: 'Visual content positioning your brand at the pinnacle of its industry.', img: '1768508947486-f54df8b43869' },
  { title: 'Social Media Content', desc: 'Curated, on-brand content designed for the digital world.', img: '1785339677570-dc2e9f50737b' },
]

function Services() {
  const [hov, setHov] = useState<number | null>(null)

  return (
    <section className="py-24 lg:py-36" style={{ background: '#0f0e0c' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="mb-14">
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">What We Do</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0]"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
          >
            Our Services
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(242,236,224,0.06)' }}>
          {SERVICES.map((svc, i) => (
            <div
              key={svc.title}
              className="relative overflow-hidden cursor-pointer"
              style={{ background: '#0f0e0c', aspectRatio: '4/3' }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            >
              <img
                src={unsplash(svc.img, 640, 480)}
                alt={svc.title}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{ transform: hov === i ? 'scale(1.07)' : 'scale(1)', filter: 'brightness(0.45)' }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-end p-7 lg:p-8"
                style={{ background: 'linear-gradient(to top, rgba(12,11,9,0.92) 0%, transparent 55%)' }}
              >
                <h3 className="font-['DM_Serif_Display'] text-[1.2rem] text-[#f2ece0] mb-2">{svc.title}</h3>
                <div
                  style={{
                    maxHeight: hov === i ? 80 : 0,
                    opacity: hov === i ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.45s ease, opacity 0.4s ease',
                  }}
                >
                  <p className="text-[12px] text-[#f2ece0]/65 leading-relaxed mb-3">{svc.desc}</p>
                  <span className="text-[10px] tracking-[0.22em] uppercase text-[#b8965a]">View Work →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
const CATS = ['ALL', 'WEDDINGS', 'EVENTS', 'CORPORATE', 'BRANDS', 'DRONE']
const PORTFOLIO = [
  { title: 'Arjun & Ananya — Wedding Story', cat: 'WEDDINGS', img: '1727430256509-0f897d6f4765', wide: true, tall: true },
  { title: 'Urban Business Summit', cat: 'CORPORATE', img: '1772690445981-78b22eacda4b', wide: false, tall: false },
  { title: 'Coastal Wedding — Chennai', cat: 'WEDDINGS', img: '1735052712464-9d24b69be5f5', wide: false, tall: true },
  { title: 'Annual Corporate Gala', cat: 'EVENTS', img: '1764255510960-deee566a91f0', wide: false, tall: false },
  { title: 'Destination Wedding', cat: 'WEDDINGS', img: '1665960213508-48f07086d49c', wide: false, tall: true },
  { title: 'Luxury Brand Campaign', cat: 'BRANDS', img: '1768508947605-8c7a50aed683', wide: true, tall: false },
  { title: 'Aerial Estate — Ooty', cat: 'DRONE', img: '1767050248602-26b7386901ce', wide: false, tall: false },
  { title: 'Pre-Wedding Stories', cat: 'WEDDINGS', img: '1633104502699-b2ecf0fee294', wide: false, tall: false },
]

function Portfolio() {
  const [cat, setCat] = useState('ALL')
  const shown = cat === 'ALL' ? PORTFOLIO : PORTFOLIO.filter((p) => p.cat === cat)

  return (
    <section className="py-24 lg:py-40 max-w-[1440px] mx-auto px-8 lg:px-16">
      <Reveal className="mb-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">Our Work</p>
            <h2
              className="font-['DM_Serif_Display'] text-[#f2ece0]"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
            >
              Featured Portfolio
            </h2>
          </div>
          <div className="flex flex-wrap gap-7">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="text-[10px] tracking-[0.28em] uppercase transition-all duration-300 pb-0.5"
                style={{
                  color: cat === c ? '#b8965a' : 'rgba(242,236,224,0.38)',
                  borderBottom: cat === c ? '1px solid #b8965a' : '1px solid transparent',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '200px' }}
      >
        {shown.map((item, i) => (
          <Reveal
            key={item.title + cat}
            delay={i * 55}
            className="relative overflow-hidden group cursor-pointer"
            style={{
              background: '#1a1814',
              gridColumn: item.wide ? 'span 2' : 'span 1',
              gridRow: item.tall ? 'span 2' : 'span 1',
            }}
          >
            <img
              src={unsplash(item.img, 800, 600)}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{ background: 'linear-gradient(to top, rgba(12,11,9,0.88) 0%, transparent 55%)' }}
            >
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-[#b8965a] mb-1">{item.cat}</p>
                <p className="font-['DM_Serif_Display'] text-[1.15rem] text-[#f2ece0]">{item.title}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── VIDEO SECTION ───────────────────────────────────────────────────────────
function VideoSection() {
  return (
    <section className="py-24 lg:py-36" style={{ background: '#0f0e0c' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="text-center mb-14">
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">Cinematic Films</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 5rem)' }}
          >
            Every Frame Tells a Story.
          </h2>
          <p className="text-sm text-[#f2ece0]/55 max-w-[440px] mx-auto leading-[1.85]">
            From emotional wedding films to brand stories and event highlights — cinematic narratives that move people.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div
            className="relative w-full overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '16/9', background: '#1a1814' }}
          >
            <img
              src={unsplash('1785339677570-dc2e9f50737b', 1600, 900)}
              alt="Cinematic event film showcase"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'brightness(0.45)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center justify-center transition-all duration-400 group-hover:scale-110"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '1px solid rgba(242,236,224,0.4)',
                  background: 'rgba(184,150,90,0.12)',
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    marginLeft: 6,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '18px solid #f2ece0',
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12">
              <p className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#f2ece0] mb-1">
                Watch Showreel
              </p>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#b8965a]">2026 Highlights — 4 min</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── DRONE SECTION ───────────────────────────────────────────────────────────
function DroneSection() {
  return (
    <section className="relative w-full flex items-center overflow-hidden" style={{ minHeight: '85vh' }}>
      <img
        src={unsplash('1767050248602-26b7386901ce', 1920, 1080)}
        alt="Aerial view of grand estate and formal gardens"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.35)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(140deg, rgba(12,11,9,0.75) 0%, rgba(12,11,9,0.1) 65%)' }}
      />
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-24 w-full py-32">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-7">Aerial Cinematography</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.0] mb-9"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 6rem)' }}
          >
            See the Moment<br />from a Different<br />Angle.
          </h2>
          <p className="text-sm text-[#f2ece0]/65 max-w-[400px] leading-[1.85] mb-11">
            Elevate your story with cinematic aerial photography and drone cinematography. Sweeping perspectives for weddings, events, and brand campaigns.
          </p>
          <a
            href="#"
            className="inline-block text-[11px] tracking-[0.22em] uppercase px-9 py-4 border border-[#b8965a] text-[#b8965a] hover:bg-[#b8965a] hover:text-[#0c0b09] transition-all duration-350"
          >
            Explore Aerial Work
          </a>
        </Reveal>
      </div>
    </section>
  )
}

// ─── WEDDING STORY ───────────────────────────────────────────────────────────
const WEDDING_IMGS = [
  { id: '1727430256509-0f897d6f4765', label: 'First Look' },
  { id: '1519741196428-6a2175fa2557', label: 'Candid Emotion' },
  { id: '1523369579000-4ec0fe04db44', label: 'The Ceremony' },
  { id: '1660455559502-8f71b47443c4', label: 'Family Moments' },
  { id: '1735052712464-9d24b69be5f5', label: 'Couple Portraits' },
  { id: '1453857271477-4f9a4081966e', label: 'The Celebration' },
]

function WeddingStory() {
  return (
    <section className="py-24 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">Wedding Photography</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.08]"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}
          >
            From the First Look<br />to the Last Dance.
          </h2>
        </Reveal>

        <div
          className="flex gap-4 lg:gap-6 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {WEDDING_IMGS.map((item, i) => {
            const widths = [280, 220, 200, 260, 240, 210]
            const aspects = ['3/4', '4/5', '2/3', '3/4', '4/5', '3/4']
            return (
              <Reveal
                key={item.id}
                delay={i * 70}
                className="flex-shrink-0 group"
                style={{ width: widths[i] }}
              >
                <div className="overflow-hidden" style={{ aspectRatio: aspects[i] }}>
                  <img
                    src={unsplash(item.id, 400, 550)}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                </div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#f2ece0]/40 mt-3">{item.label}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── CORPORATE SECTION ───────────────────────────────────────────────────────
const CORP_ITEMS = [
  { img: '1772690445981-78b22eacda4b', label: 'Conferences' },
  { img: '1764255510960-deee566a91f0', label: 'Award Galas' },
  { img: '1768508947605-8c7a50aed683', label: 'Networking Events' },
  { img: '1768508947486-f54df8b43869', label: 'Product Launches' },
]

function CorporateSection() {
  return (
    <section className="py-24 lg:py-36" style={{ background: '#0f0e0c' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="mb-14">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">Corporate &amp; Events</p>
              <h2
                className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.08]"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
              >
                Your Event.<br />Professionally Preserved.
              </h2>
            </div>
            <p className="text-sm text-[#f2ece0]/55 leading-[1.9]">
              From intimate business gatherings to large-scale conferences and award ceremonies — photography and video that reflects the calibre of your brand.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {CORP_ITEMS.map((item, i) => (
            <Reveal key={item.img} delay={i * 70} className="relative group overflow-hidden" style={{ background: '#1a1814' }}>
              <img
                src={unsplash(item.img, 500, 620)}
                alt={item.label}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                style={{ aspectRatio: '3/4', filter: 'brightness(0.55)' }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{ background: 'linear-gradient(to top, rgba(12,11,9,0.8) 0%, transparent 60%)' }}
              >
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#f2ece0]/80">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ABOUT ───────────────────────────────────────────────────────────────────
const STATS = [
  { num: '100+', label: 'Events Captured' },
  { num: '50+', label: 'Wedding Stories' },
  { num: '25+', label: 'Corporate Events' },
  { num: '10+', label: 'Destinations' },
]

function AboutSection() {
  return (
    <section className="py-24 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-28 items-center">
        <Reveal>
          <img
            src={unsplash('1768508950778-9ba70d4445e9', 800, 1000)}
            alt="Couple at a formal dinner event"
            className="w-full object-cover"
            style={{ aspectRatio: '4/5' }}
          />
        </Reveal>

        <Reveal delay={180}>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-8">About</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] mb-8"
            style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)' }}
          >
            Behind the Lens.
          </h2>
          <p className="text-sm text-[#f2ece0]/55 leading-[1.95] mb-12">
            We believe great photography isn't about simply recording what happened. It's about noticing the emotion, energy, details, and moments that make an event unforgettable. Every frame we capture carries intention — and a story worth telling for decades.
          </p>
          <div
            className="grid grid-cols-2 gap-8 border-t pt-10"
            style={{ borderColor: 'rgba(242,236,224,0.1)' }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-['DM_Serif_Display'] text-[2.4rem] text-[#b8965a] leading-none mb-2">{s.num}</p>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#f2ece0]/45">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "They didn't just photograph our wedding. They captured every emotion, every laugh, and every little moment we never want to forget.",
    name: 'Priya & Rahul Sharma',
    type: 'Wedding — New Delhi',
    img: '1630526720753-aa4e71acf67d',
  },
  {
    quote: 'The corporate event coverage was exceptional. Professional, unobtrusive, and the final imagery elevated our entire brand presentation.',
    name: 'Aditya Mehta',
    type: 'Corporate Summit — Mumbai',
    img: '1595970730815-f87de7a62635',
  },
  {
    quote: 'Our pre-wedding shoot felt like a luxury editorial. The team\'s creative vision transformed our memories into art.',
    name: 'Sneha & Vikram Nair',
    type: 'Pre-Wedding — Goa',
    img: '1660455559502-8f71b47443c4',
  },
]

function Testimonials() {
  const [cur, setCur] = useState(0)
  const t = TESTIMONIALS[cur]

  return (
    <section className="py-24 lg:py-36" style={{ background: '#0f0e0c' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="text-center mb-4">
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a]">Client Stories</p>
        </Reveal>

        <div className="max-w-3xl mx-auto text-center py-8">
          <p
            className="font-['DM_Serif_Display'] text-[#b8965a]/25 leading-none mb-2 select-none"
            style={{ fontSize: 'clamp(6rem, 12vw, 10rem)' }}
          >
            "
          </p>
          <p
            key={cur}
            className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.5] mb-10"
            style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)',
              animation: 'fadeUp 0.6s ease both',
            }}
          >
            {t.quote}
          </p>
          <div className="flex items-center justify-center gap-4 mb-10">
            <img
              src={unsplash(t.img, 80, 80)}
              alt={t.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm text-[#f2ece0] font-medium">{t.name}</p>
              <p className="text-[11px] text-[#f2ece0]/45 tracking-wide">{t.type}</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                aria-label={`Testimonial ${i + 1}`}
                className="rounded-full transition-all duration-350"
                style={{
                  width: i === cur ? 24 : 6,
                  height: 6,
                  background: i === cur ? '#b8965a' : 'rgba(242,236,224,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── INSTAGRAM GRID ──────────────────────────────────────────────────────────
const INSTA = [
  '1727430256509-0f897d6f4765',
  '1665960213508-48f07086d49c',
  '1735052712464-9d24b69be5f5',
  '1519741196428-6a2175fa2557',
  '1523369579000-4ec0fe04db44',
  '1767050248602-26b7386901ce',
  '1764255510960-deee566a91f0',
  '1768508947605-8c7a50aed683',
  '1785339677570-dc2e9f50737b',
]

function InstagramGrid() {
  return (
    <section className="py-24 lg:py-36 max-w-[1440px] mx-auto px-8 lg:px-16">
      <Reveal className="text-center mb-12">
        <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">@frameandsoul</p>
        <h2
          className="font-['DM_Serif_Display'] text-[#f2ece0] mb-7"
          style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
        >
          Follow the Stories.
        </h2>
      </Reveal>

      <div className="grid grid-cols-3 lg:grid-cols-9 gap-1 mb-9">
        {INSTA.map((id, i) => (
          <Reveal
            key={id}
            delay={i * 35}
            className="relative overflow-hidden group cursor-pointer"
            style={{ background: '#1a1814', aspectRatio: '1/1' }}
          >
            <img
              src={unsplash(id, 280, 280)}
              alt="Studio photography on Instagram"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#0c0b09]/55 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center">
              <span className="text-[#f2ece0] text-xl">♡</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center">
        <a
          href="#"
          className="inline-block text-[11px] tracking-[0.22em] uppercase px-9 py-4 border text-[#f2ece0]/65 hover:border-[#b8965a] hover:text-[#b8965a] transition-all duration-350"
          style={{ borderColor: 'rgba(242,236,224,0.18)' }}
        >
          Follow Us on Instagram
        </a>
      </Reveal>
    </section>
  )
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
const POSTS = [
  { title: 'A Chennai Wedding Through Our Lens', date: 'Jul 2026', cat: 'Weddings', img: '1727430256509-0f897d6f4765' },
  { title: 'How We Capture Authentic Wedding Moments', date: 'Jun 2026', cat: 'Stories', img: '1519741196428-6a2175fa2557' },
  { title: 'Behind the Scenes of a Corporate Event', date: 'May 2026', cat: 'Corporate', img: '1772690445981-78b22eacda4b' },
  { title: 'The Art of Cinematic Drone Photography', date: 'Apr 2026', cat: 'Aerial', img: '1767050248602-26b7386901ce' },
]

function Journal() {
  return (
    <section className="py-24 lg:py-36" style={{ background: '#0f0e0c' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <Reveal className="mb-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-4">Journal</p>
              <h2
                className="font-['DM_Serif_Display'] text-[#f2ece0]"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
              >
                Stories &amp; Insights
              </h2>
            </div>
            <a
              href="#"
              className="hidden lg:inline text-[11px] tracking-[0.22em] uppercase text-[#b8965a] border-b border-[#b8965a]/35 pb-0.5 hover:border-[#b8965a] transition-colors duration-300"
            >
              View All →
            </a>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-4 gap-6">
          {POSTS.map((post, i) => (
            <Reveal key={post.title} delay={i * 70} className="group cursor-pointer">
              <div className="overflow-hidden mb-5" style={{ background: '#1a1814' }}>
                <img
                  src={unsplash(post.img, 480, 320)}
                  alt={post.title}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  style={{ aspectRatio: '3/2' }}
                />
              </div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#b8965a] mb-2">
                {post.cat} — {post.date}
              </p>
              <h3
                className="font-['DM_Serif_Display'] text-[#f2ece0] leading-snug transition-colors duration-300 group-hover:text-[#b8965a]"
                style={{ fontSize: '1.15rem' }}
              >
                {post.title}
              </h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '85vh' }}>
      <img
        src={unsplash('1665960213508-48f07086d49c', 1920, 1080)}
        alt="Indian couple — final call to action"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.28)' }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(12,11,9,0.45)' }} />
      <div className="relative z-10 text-center px-8 py-28">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#b8965a] mb-7">Get in Touch</p>
          <h2
            className="font-['DM_Serif_Display'] text-[#f2ece0] leading-[1.04] mb-8"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 6rem)' }}
          >
            Let's Create Something<br />Worth Remembering.
          </h2>
          <p className="text-sm text-[#f2ece0]/60 max-w-[380px] mx-auto leading-[1.85] mb-12">
            Have an event, wedding, brand story, or celebration coming up? Let's talk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="text-[11px] tracking-[0.22em] uppercase px-11 py-4 bg-[#b8965a] text-[#0c0b09] font-medium hover:bg-[#f2ece0] transition-all duration-350"
            >
              Check Availability
            </a>
            <a
              href="#"
              className="text-[11px] tracking-[0.22em] uppercase px-11 py-4 border text-[#f2ece0] hover:border-[#f2ece0] transition-all duration-350"
              style={{ borderColor: 'rgba(242,236,224,0.35)' }}
            >
              Start a Conversation
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#080706', borderTop: '1px solid rgba(242,236,224,0.07)' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[2fr_1fr_1fr_1.4fr] gap-12 lg:gap-16 mb-16">
          <div>
            <span className="font-['DM_Serif_Display'] text-2xl tracking-[0.22em] uppercase text-[#f2ece0] block mb-5">
              Frame &amp; Soul
            </span>
            <p className="text-[12px] text-[#f2ece0]/38 leading-[1.85] max-w-[260px]">
              A premium photography and videography studio capturing weddings, events, brands, and the moments that define us.
            </p>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-[#b8965a] mb-6">Navigate</p>
            <div className="flex flex-col gap-3.5">
              {['Home', 'Portfolio', 'Services', 'About', 'Stories', 'Contact'].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-[12px] text-[#f2ece0]/48 hover:text-[#f2ece0] transition-colors duration-300 tracking-wide"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-[#b8965a] mb-6">Services</p>
            <div className="flex flex-col gap-3.5">
              {['Wedding Photography', 'Wedding Films', 'Corporate Events', 'Event Videography', 'Drone & Aerial', 'Brand Photography'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[12px] text-[#f2ece0]/48 hover:text-[#f2ece0] transition-colors duration-300 tracking-wide"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-[#b8965a] mb-6">Contact</p>
            <div className="flex flex-col gap-3.5 mb-8">
              <a href="mailto:hello@frameandsoul.in" className="text-[12px] text-[#f2ece0]/48 hover:text-[#f2ece0] transition-colors duration-300">
                hello@frameandsoul.in
              </a>
              <a href="tel:+919876543210" className="text-[12px] text-[#f2ece0]/48 hover:text-[#f2ece0] transition-colors duration-300">
                +91 98765 43210
              </a>
              <p className="text-[12px] text-[#f2ece0]/38">Chennai, Tamil Nadu, India</p>
            </div>
            <div className="flex gap-6">
              {['Instagram', 'YouTube', 'WhatsApp'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[10px] tracking-[0.18em] uppercase text-[#f2ece0]/35 hover:text-[#b8965a] transition-colors duration-300"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(242,236,224,0.07)' }}
        >
          <p className="text-[10px] text-[#f2ece0]/28 tracking-[0.18em]">
            © 2026 Frame &amp; Soul. All Rights Reserved.
          </p>
          <p className="text-[10px] text-[#f2ece0]/18 tracking-[0.22em] uppercase">
            Photography &amp; Videography Studio — Chennai
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: '#0c0b09', color: '#f2ece0' }}>
      <Nav />
      <Hero />
      <StudioStatement />
      <Services />
      <Portfolio />
      <VideoSection />
      <DroneSection />
      <WeddingStory />
      <CorporateSection />
      <AboutSection />
      <Testimonials />
      <InstagramGrid />
      <Journal />
      <FinalCTA />
      <Footer />
    </div>
  )
}
