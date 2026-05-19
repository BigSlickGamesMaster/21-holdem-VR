import { useMemo } from 'react'
import { CanvasTexture, DoubleSide, LinearFilter } from 'three'
import type { Card } from '../../game/types/cards'

type CardViewProps = {
  card: Card
  position: [number, number, number]
  faceUp?: boolean
  opacity?: number
}

export function CardView({ card, position, faceUp = true, opacity = 1 }: CardViewProps) {
  const texture = useMemo(() => createCardTexture(card, faceUp), [card, faceUp])

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[0.16, 0.22]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} side={DoubleSide} />
    </mesh>
  </group>
)
}

function createCardTexture(card: Card, faceUp: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 704

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  if (!faceUp) {
    drawCardBack(context, canvas.width, canvas.height)
  } else {
    drawCardFace(context, canvas.width, canvas.height, card)
  }

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function drawCardFace(context: CanvasRenderingContext2D, width: number, height: number, card: Card) {
  const color = card.suit === 'hearts' || card.suit === 'diamonds' ? '#b81f2d' : '#111318'
  const rank = card.rank

  context.fillStyle = '#f8f6ef'
  roundedRect(context, 0, 0, width, height, 34)
  context.fill()
  context.strokeStyle = '#d8d2c2'
  context.lineWidth = 10
  context.stroke()

  context.fillStyle = color
  drawSuitIcon(context, card.suit, 70, 70, 34)
  drawSuitIcon(context, card.suit, width - 70, height - 70, 34)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `800 ${rank === '10' ? 255 : 310}px Arial, Helvetica, sans-serif`
  context.fillText(rank, width / 2, height / 2 + 10)
}

function drawCardBack(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = '#1f3d68'
  roundedRect(context, 0, 0, width, height, 34)
  context.fill()
  context.strokeStyle = '#8fb4ff'
  context.lineWidth = 12
  context.stroke()

  context.fillStyle = '#162a4a'
  roundedRect(context, 46, 46, width - 92, height - 92, 22)
  context.fill()
  context.strokeStyle = '#2d6ef1'
  context.lineWidth = 7
  context.stroke()

  context.fillStyle = '#f7f9ff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '800 92px Arial, Helvetica, sans-serif'
  context.fillText('BSG', width / 2, height / 2)
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

function drawSuitIcon(context: CanvasRenderingContext2D, suit: Card['suit'], x: number, y: number, size: number) {
  context.save()
  context.translate(x, y)
  context.beginPath()

  if (suit === 'diamonds') {
    context.moveTo(0, -size)
    context.lineTo(size * 0.72, 0)
    context.lineTo(0, size)
    context.lineTo(-size * 0.72, 0)
    context.closePath()
  } else if (suit === 'hearts') {
    context.moveTo(0, size * 0.78)
    context.bezierCurveTo(-size * 1.15, 0, -size * 0.9, -size * 0.8, 0, -size * 0.36)
    context.bezierCurveTo(size * 0.9, -size * 0.8, size * 1.15, 0, 0, size * 0.78)
    context.closePath()
  } else if (suit === 'spades') {
    context.moveTo(0, -size * 0.9)
    context.bezierCurveTo(-size * 1.15, -size * 0.05, -size * 0.72, size * 0.58, 0, size * 0.22)
    context.bezierCurveTo(size * 0.72, size * 0.58, size * 1.15, -size * 0.05, 0, -size * 0.9)
    context.closePath()
    context.moveTo(-size * 0.33, size * 0.86)
    context.quadraticCurveTo(0, size * 0.42, size * 0.33, size * 0.86)
  } else {
    context.arc(0, -size * 0.36, size * 0.38, 0, Math.PI * 2)
    context.moveTo(-size * 0.28, size * 0.1)
    context.arc(-size * 0.36, size * 0.1, size * 0.38, 0, Math.PI * 2)
    context.moveTo(size * 0.48, size * 0.1)
    context.arc(size * 0.36, size * 0.1, size * 0.38, 0, Math.PI * 2)
    context.moveTo(-size * 0.24, size * 0.86)
    context.quadraticCurveTo(0, size * 0.38, size * 0.24, size * 0.86)
  }

  context.fill()
  context.restore()
}
