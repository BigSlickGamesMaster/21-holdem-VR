import { useMemo } from 'react'
import { CanvasTexture, LinearFilter } from 'three'

type CanvasLabelProps = {
  text: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  fontSize?: number
  background?: string
  color?: string
}

export function CanvasLabel({
  text,
  position,
  rotation = [-Math.PI / 2, 0, 0],
  width,
  height,
  fontSize = 54,
  background = '#24382a',
  color = '#f4f1e8',
}: CanvasLabelProps) {
  const texture = useMemo(() => createLabelTexture(text, fontSize, background, color), [background, color, fontSize, text])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  )
}

function createLabelTexture(text: string, fontSize: number, background: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 384

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.fillStyle = background
  roundRect(context, 0, 0, canvas.width, canvas.height, 22)
  context.fill()

  context.fillStyle = color
  context.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(fitText(context, text, canvas.width - 88), canvas.width / 2, canvas.height / 2)

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) {
    return text
  }

  let fitted = text
  while (fitted.length > 3 && context.measureText(`${fitted}...`).width > maxWidth) {
    fitted = fitted.slice(0, -1)
  }

  return `${fitted}...`
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}
