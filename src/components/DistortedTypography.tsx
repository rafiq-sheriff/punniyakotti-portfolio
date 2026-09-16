import { useEffect, useRef, useState } from 'react'

interface DistortedTypographyProps {
  text?: string
  theme?: 'dark' | 'light'
  className?: string
}

export default function DistortedTypography({
  text = 'PORTFOLIO',
  theme = 'light',
  className = '',
}: DistortedTypographyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglSupported, setWebglSupported] = useState(true)

  const isDark = theme === 'dark'

  // Ref to hold animation and mouse tracking state without re-renders
  const stateRef = useRef({
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    hoverFactor: 0,
    targetHoverFactor: 0,
    isHovered: false,
    text: text,
    theme: theme,
    fontsLoaded: false,
  })

  // Update text & theme refs on change
  useEffect(() => {
    stateRef.current.text = text
    stateRef.current.theme = theme
  }, [text, theme])

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setWebglSupported(false)
      return
    }

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      setWebglSupported(false)
      return
    }

    // ── GLSL Shaders ──
    const vertShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    const fragShaderSource = `
      precision highp float;

      uniform sampler2D u_texture;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      uniform float u_hover;
      uniform float u_time;
      uniform float u_isDark;

      varying vec2 v_texCoord;

      // 2D Simplex Noise generator for organic fluid displacement
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
               + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = v_texCoord;

        // Aspect ratio correction to keep distortion perfectly circular
        float aspect = u_resolution.x / u_resolution.y;
        vec2 aspectVec = vec2(aspect, 1.0);

        vec2 st = uv * aspectVec;
        vec2 mouseSt = u_mouse * aspectVec;

        float dist = length(st - mouseSt);

        // Radial falloff radius (localized around the cursor)
        float radius = 0.24;
        float falloff = smoothstep(radius, 0.0, dist);
        falloff = pow(falloff, 1.35); // Smooth radial decay

        // Direction vector from mouse origin to UV
        vec2 dir = (dist > 0.0001) ? normalize(st - mouseSt) : vec2(0.0, 1.0);
        dir = dir / aspectVec;

        // Organic temporal wave oscillations
        float wave1 = sin(dist * 28.0 - u_time * 3.2) * 0.5 + 0.5;
        float wave2 = cos(dist * 18.0 - u_time * 2.4) * 0.5 + 0.5;
        float n = snoise(uv * 7.0 + vec2(u_time * 0.4, u_time * 0.3));

        // Push displacement vector (liquid displacement expanding outward)
        vec2 pushDistort = dir * (0.055 + 0.035 * wave1 + 0.02 * n) * falloff;

        // Tangential swirl component for organic letter bending
        vec2 perp = vec2(-dir.y, dir.x);
        vec2 swirlDistort = perp * (sin(dist * 20.0 - u_time * 2.8) * 0.025 + 0.015 * wave2) * falloff;

        vec2 totalDisplacement = (pushDistort + swirlDistort) * u_hover;

        // Displaced UV sampling
        vec2 displacedUV = clamp(uv - totalDisplacement, 0.0, 1.0);
        vec4 texColor = texture2D(u_texture, displacedUV);

        // Liquid glass refraction edge highlight (matching reference image 2)
        float dispMag = length(totalDisplacement * aspectVec);
        float refraction = pow(dispMag * 14.0, 2.2) * falloff * u_hover;

        vec3 highlight = (u_isDark > 0.5) 
          ? vec3(1.0, 0.95, 0.9) * refraction * 0.35
          : vec3(0.1, 0.08, 0.05) * refraction * 0.25;

        gl_FragColor = vec4(texColor.rgb + highlight, texColor.a);
      }
    `

    // Compile helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertShader = createShader(gl.VERTEX_SHADER, vertShaderSource)
    const fragShader = createShader(gl.FRAGMENT_SHADER, fragShaderSource)

    if (!vertShader || !fragShader) {
      setWebglSupported(false)
      return
    }

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      setWebglSupported(false)
      return
    }

    gl.useProgram(program)

    // Quad geometry (Full Canvas Coverage)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    )

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        1, 0,
      ]),
      gl.STATIC_DRAW
    )

    const aPositionLoc = gl.getAttribLocation(program, 'a_position')
    const aTexCoordLoc = gl.getAttribLocation(program, 'a_texCoord')

    const uTextureLoc = gl.getUniformLocation(program, 'u_texture')
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const uHoverLoc = gl.getUniformLocation(program, 'u_hover')
    const uTimeLoc = gl.getUniformLocation(program, 'u_time')
    const uIsDarkLoc = gl.getUniformLocation(program, 'u_isDark')

    // Create Offscreen 2D Canvas for crisp text rendering
    const offscreenCanvas = document.createElement('canvas')
    const offscreenCtx = offscreenCanvas.getContext('2d')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    let textureNeedsUpdate = true

    // Render Text to Offscreen 2D Canvas
    const updateOffscreenText = (width: number, height: number) => {
      if (!offscreenCtx) return

      offscreenCanvas.width = width
      offscreenCanvas.height = height

      offscreenCtx.clearRect(0, 0, width, height)

      const isCurrentDark = stateRef.current.theme === 'dark'
      const currentText = stateRef.current.text

      // Dynamic font size and tracking matching PORTFOLIO design
      const isMobile = width < 640
      const fontSize = isMobile
        ? Math.min(Math.max(width * 0.11, 32), 68)
        : Math.min(Math.max(width * 0.165, 120), 260)
      const letterSpacingPx = fontSize * 0.08

      offscreenCtx.save()

      // Manrope ExtraBold (800)
      offscreenCtx.font = `800 ${fontSize}px 'Manrope', sans-serif`
      offscreenCtx.textAlign = 'center'
      offscreenCtx.textBaseline = 'middle'

      // Color selection matching user specifications
      // Light mode: background white, text near-black (#1c1917)
      // Dark mode: background near-black, text white (#f2ece0)
      if (isCurrentDark) {
        offscreenCtx.fillStyle = 'rgba(242, 236, 224, 0.22)'
      } else {
        offscreenCtx.fillStyle = 'rgba(28, 25, 23, 0.12)'
      }

      // Draw text with positive tracking (letter spacing)
      const centerX = width / 2
      const centerY = height / 2

      const ctx = offscreenCtx as any
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${letterSpacingPx}px`
        ctx.fillText(currentText, centerX, centerY)
      } else {
        // Character-by-character tracking fallback
        let totalWidth = 0
        const charWidths: number[] = []
        for (let i = 0; i < currentText.length; i++) {
          const w = ctx.measureText(currentText[i]).width
          charWidths.push(w)
          totalWidth += w + (i < currentText.length - 1 ? letterSpacingPx : 0)
        }
        let currentX = centerX - totalWidth / 2
        for (let i = 0; i < currentText.length; i++) {
          ctx.fillText(currentText[i], currentX + charWidths[i] / 2, centerY)
          currentX += charWidths[i] + letterSpacingPx
        }
      }

      offscreenCtx.restore()

      // Upload offscreen canvas to WebGL texture
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreenCanvas)
      textureNeedsUpdate = false
    }

    // Wait for fonts to load before initial draw
    document.fonts.ready.then(() => {
      stateRef.current.fontsLoaded = true
      textureNeedsUpdate = true
    })

    let isInView = true
    let animationFrameId: number | null = null

    // Pointer Event Listeners — active only when element is in view
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!container || !isInView) return
      const rect = container.getBoundingClientRect()
      let clientX = 0
      let clientY = 0

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }

      // Check if mouse is anywhere inside or near container
      const u = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const v = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

      stateRef.current.targetMouseX = u
      stateRef.current.targetMouseY = v
      stateRef.current.targetHoverFactor = 1.0
      stateRef.current.isHovered = true
    }

    const handlePointerLeave = () => {
      stateRef.current.targetHoverFactor = 0.0
      stateRef.current.isHovered = false
    }

    // Attach mouse/touch listeners to window for smooth tracking
    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true })
    window.addEventListener('touchend', handlePointerLeave, { passive: true })

    // Animation Loop
    let startTime = performance.now()
    let lastWidth = 0
    let lastHeight = 0
    let lastTheme = stateRef.current.theme
    let lastText = stateRef.current.text

    const render = (time: number) => {
      if (!isInView) {
        animationFrameId = null
        return
      }

      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.floor(rect.width * dpr)
      const height = Math.floor(rect.height * dpr)

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      // Resize Canvas & Texture if dimensions or theme changed
      if (
        width !== lastWidth ||
        height !== lastHeight ||
        stateRef.current.theme !== lastTheme ||
        stateRef.current.text !== lastText ||
        textureNeedsUpdate
      ) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        updateOffscreenText(width, height)

        lastWidth = width
        lastHeight = height
        lastTheme = stateRef.current.theme
        lastText = stateRef.current.text
      }

      // Smooth Spring Lerp Interpolation for Mouse Position & Hover Factor
      const mouseSpeed = 0.12
      stateRef.current.mouseX += (stateRef.current.targetMouseX - stateRef.current.mouseX) * mouseSpeed
      stateRef.current.mouseY += (stateRef.current.targetMouseY - stateRef.current.mouseY) * mouseSpeed

      const hoverSpeed = stateRef.current.targetHoverFactor > stateRef.current.hoverFactor ? 0.1 : 0.05
      stateRef.current.hoverFactor += (stateRef.current.targetHoverFactor - stateRef.current.hoverFactor) * hoverSpeed

      const elapsed = (time - startTime) / 1000.0

      // Render WebGL
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      // Bind Geometry Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPositionLoc)
      gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(aTexCoordLoc)
      gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0)

      // Set Uniforms
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(uTextureLoc, 0)

      gl.uniform2f(uMouseLoc, stateRef.current.mouseX, stateRef.current.mouseY)
      gl.uniform2f(uResolutionLoc, width, height)
      gl.uniform1f(uHoverLoc, stateRef.current.hoverFactor)
      gl.uniform1f(uTimeLoc, elapsed)
      gl.uniform1f(uIsDarkLoc, stateRef.current.theme === 'dark' ? 1.0 : 0.0)

      // Draw Quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      if (isInView) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    // IntersectionObserver to pause WebGL rendering when out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasInView = isInView
        isInView = entry.isIntersecting
        if (isInView && !wasInView) {
          startTime = performance.now()
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(render)
          }
        } else if (!isInView && animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(container)
    animationFrameId = requestAnimationFrame(render)

    return () => {
      observer.disconnect()
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerLeave)

      if (gl) {
        gl.deleteBuffer(positionBuffer)
        gl.deleteBuffer(texCoordBuffer)
        gl.deleteTexture(texture)
        gl.deleteProgram(program)
        gl.deleteShader(vertShader)
        gl.deleteShader(fragShader)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-500"
        />
      ) : (
        /* Fallback for non-WebGL / reduced-motion environments */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-2">
          <span
            className={`font-['Manrope'] font-extrabold uppercase transition-colors duration-700 whitespace-nowrap text-center ${
              isDark ? 'text-[#f2ece0]/22' : 'text-[#1c1917]/12'
            }`}
            style={{
              fontSize: 'clamp(32px, 11vw, 260px)',
              letterSpacing: '0.08em',
              paddingLeft: '0.08em',
            }}
          >
            {text}
          </span>
        </div>
      )}
    </div>
  )
}
