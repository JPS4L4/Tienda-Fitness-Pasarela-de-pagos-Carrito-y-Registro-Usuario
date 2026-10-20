import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, renderBrandImage } from '@/lib/ogImage'

export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderBrandImage()
}
