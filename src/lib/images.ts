type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void }

/** An SVG with no usable size of its own is drawn this big, so it stays sharp when shrunk. */
const SVG_SIZE = 1024

/**
 * Reads a picture so it can be drawn on a canvas. Photos go through
 * createImageBitmap (which also applies their rotation); SVGs don't decode
 * there, so they're loaded as an image instead, given a size from their
 * viewBox if they have none.
 */
async function decode(file: File): Promise<Decoded> {
  if (file.type !== 'image/svg+xml' && !/\.svg$/i.test(file.name)) {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
  }
  const svg = new DOMParser().parseFromString(await file.text(), 'image/svg+xml').documentElement
  if (svg.nodeName !== 'svg') throw new Error('Not an SVG')
  const length = (name: string) => {
    const v = svg.getAttribute(name)
    return v && !v.endsWith('%') ? parseFloat(v) || 0 : 0
  }
  const [, , boxWidth = 0, boxHeight = 0] = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number)
  const width = length('width') || boxWidth || SVG_SIZE
  const height = length('height') || boxHeight || SVG_SIZE
  const scale = SVG_SIZE / Math.max(width, height)
  svg.setAttribute('width', String(width * scale))
  svg.setAttribute('height', String(height * scale))
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
  const img = new Image()
  img.src = url
  await img.decode()
  return { source: img, width: width * scale, height: height * scale, close: () => URL.revokeObjectURL(url) }
}

/** Shrinks a photo so its longest side is at most `maxSize` px and re-encodes it as JPEG. */
export async function resizeImage(file: File, maxSize: number, quality = 0.85): Promise<Blob> {
  const image = await decode(file)
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')!.drawImage(image.source, 0, 0, canvas.width, canvas.height)
  image.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/jpeg', quality),
  )
}

/**
 * A logo as a `size` px square PNG data: URL. See-through margins are
 * trimmed off, then the whole picture fits inside, centred, with see-through
 * space around one that isn't square, so nothing is cropped off. An SVG
 * becomes a PNG here, which also means nothing in it can run.
 */
export async function squareLogoDataUrl(file: File, size: number): Promise<string> {
  const image = await decode(file)
  // Draw it large first to find where the picture actually is.
  const big = document.createElement('canvas')
  const fit = Math.min(1, 1024 / Math.max(image.width, image.height))
  big.width = Math.max(1, Math.round(image.width * fit))
  big.height = Math.max(1, Math.round(image.height * fit))
  const bg = big.getContext('2d', { willReadFrequently: true })!
  bg.drawImage(image.source, 0, 0, big.width, big.height)
  image.close()
  const box = visibleBox(bg.getImageData(0, 0, big.width, big.height)) ?? { x: 0, y: 0, w: big.width, h: big.height }

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const scale = size / Math.max(box.w, box.h)
  const w = box.w * scale
  const h = box.h * scale
  canvas.getContext('2d')!.drawImage(big, box.x, box.y, box.w, box.h, (size - w) / 2, (size - h) / 2, w, h)
  return canvas.toDataURL('image/png')
}

/** The smallest box around the pixels that aren't (nearly) see-through; null if there are none. */
export function visibleBox({ data, width, height }: Pick<ImageData, 'data' | 'width' | 'height'>) {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 8) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        bottom = y
      }
    }
  }
  return right < 0 ? null : { x: left, y: top, w: right - left + 1, h: bottom - top + 1 }
}
