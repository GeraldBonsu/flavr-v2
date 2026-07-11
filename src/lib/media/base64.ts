export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const result = (e.target?.result as string) ?? ''
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export interface ResizedImage {
  base64: string
  mediaType: string
}

/**
 * Downscales/recompresses an image before upload. Camera captures (especially via
 * `capture="environment"`) can be 4-10MB, which as base64 easily exceeds Vercel's
 * ~4.5MB serverless request body limit — the request gets rejected at the platform
 * edge before the function (or Claude) ever sees it. Resizing keeps plenty of detail
 * for vision analysis while staying well under that limit.
 */
export function resizeImageToBase64(file: File, maxDimension = 1280, quality = 0.82): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas unavailable')); return }
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ base64: dataUrl.split(',')[1] ?? '', mediaType: 'image/jpeg' })
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('image load failed')) }
    img.src = objectUrl
  })
}
