import type { DemoSeat } from '../mockData/demoHand'
import type { GameState } from '../types/game'
import { resolveShowdown } from './showdown'

export function seatsForNextHand(game: GameState): DemoSeat[] {
  const payouts = game.phase === 'showdown' ? resolveShowdown(game).payouts : {}

  return game.players.map((player) => ({
    id: player.id,
    seat: player.seat,
    name: player.name,
    chips: roundToHalf(player.chips + (payouts[player.id] ?? 0)),
  }))
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2
}
