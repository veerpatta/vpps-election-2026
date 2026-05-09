const MAX_DIMENSION = 720
const JPEG_QUALITY = 0.85

export class ImageUploadError extends Error {}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ImageUploadError('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new ImageUploadError('Could not decode the image.'))
    image.src = src
  })
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageUploadError('Please upload an image file.')
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new ImageUploadError('Image is larger than 12 MB. Please pick a smaller photo.')
  }

  const sourceUrl = await readFileAsDataUrl(file)
  const image = await loadImage(sourceUrl)

  const ratio = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * ratio))
  const height = Math.max(1, Math.round(image.naturalHeight * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageUploadError('Browser does not support image processing.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)

  const isPng = file.type === 'image/png'
  const mime = isPng ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(mime, isPng ? undefined : JPEG_QUALITY)
}
