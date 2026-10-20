// lib/ogImage.tsx
// Imagen Open Graph / Twitter generada con la identidad actual (oscuro, agresivo, condensado).
// La tipografía Anton viaja en el repo (app/fonts, licencia OFL): no se descarga nada al compilar.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'
export const OG_ALT = `${BRAND_NAME} | ${BRAND_TAGLINE}`

const BG = '#0a0a0b'
const ACCENT = '#ff4d14'
const FG = '#f5f3ef'

export async function renderBrandImage(): Promise<ImageResponse> {
  const anton = await readFile(path.join(process.cwd(), 'app', 'fonts', 'Anton-Regular.ttf'))
  const [first, ...rest] = BRAND_NAME.toUpperCase().split(' ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: BG,
          fontFamily: 'Anton',
        }}
      >
        {/* Corte diagonal de acento */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -140,
            width: 470,
            height: 790,
            background: ACCENT,
            transform: 'skewX(-18deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: 250,
            width: 36,
            height: 790,
            background: FG,
            transform: 'skewX(-18deg)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 80px',
            width: 860,
          }}
        >
          <div style={{ width: 120, height: 14, background: ACCENT, marginBottom: 36, display: 'flex' }} />
          <div style={{ fontSize: 210, lineHeight: 0.92, color: FG, letterSpacing: 2, display: 'flex' }}>{first}</div>
          <div style={{ fontSize: 210, lineHeight: 0.92, color: ACCENT, letterSpacing: 2, display: 'flex' }}>
            {rest.join(' ')}
          </div>
          <div
            style={{
              marginTop: 44,
              fontSize: 36,
              color: FG,
              opacity: 0.85,
              letterSpacing: 4,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {BRAND_TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Anton', data: anton, style: 'normal', weight: 400 }] }
  )
}
