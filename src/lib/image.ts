// Client-side image compression. Resizes and JPEG-encodes images into small
// base64 data URLs so a listing can carry its photos directly inside its
// Firestore document — no Firebase Storage and no CORS configuration required.

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function fitWithin(w: number, h: number, maxDim: number): { w: number; h: number } {
  if (w <= maxDim && h <= maxDim) return { w, h }
  const ratio = w > h ? maxDim / w : maxDim / h
  return { w: Math.round(w * ratio), h: Math.round(h * ratio) }
}

/**
 * Compress one image to a JPEG data URL whose stored size stays under
 * `maxStringBytes` (keeps Firestore documents well below the 1 MB limit).
 */
export async function compressImageToDataUrl(
  file: File,
  maxDim = 1000,
  maxStringBytes = 110 * 1024
): Promise<string> {
  if (!file.type.startsWith('image/')) return ''
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  let { w, h } = fitWithin(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxDim
  )
  let quality = 0.82

  const draw = (): string => {
    canvas.width = w
    canvas.height = h
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  }

  let out = draw()
  let guard = 0
  while (out.length > maxStringBytes && guard < 12) {
    guard += 1
    if (quality > 0.45) {
      quality -= 0.12
    } else {
      w = Math.max(320, Math.round(w * 0.85))
      h = Math.max(240, Math.round(h * 0.85))
    }
    out = draw()
  }
  return out
}

export async function compressImages(files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map((f) => compressImageToDataUrl(f)))
  return results.filter(Boolean)
}
