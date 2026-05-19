import type { Card } from './cards'

export type PlayerHandState = 'active' | 'standing' | 'folded' | 'bust' | 'all-in'

export type Player = {
  id: string
  seat: number
  name: string
  chips: number
  contribution: number
  state: PlayerHandState
  holeCards: Card[]
  acceptedCommunityCount: number
}

export type GamePhase =
  | 'setup'
  | 'private-cards'
  | 'player-action'
  | 'community-card'
  | 'showdown'
  | 'payout'

export type GameState = {
  phase: GamePhase
  activePlayerId: string
  dealerPlayerId?: string
  smallBlindPlayerId?: string
  bigBlindPlayerId?: string
  currentBet: number
  minRaise: number
  communityCards: Card[]
  deck?: Card[]
  maxCommunityCards?: number
  actedThisRound?: string[]
  pots?: Pot[]
  players: Player[]
}

export type Pot = {
  id: string
  amount: number
  eligiblePlayerIds: string[]
  contributionCap: number
}

export type PotAward = {
  potId: string
  amount: number
  winnerIds: string[]
  share: number
  reason: string
}

export type ShowdownResult = {
  awards: PotAward[]
  refunds: Record<string, number>
  totals: Record<string, { total: number; bust: boolean }>
  payouts: Record<string, number>
}

export type LegalAction =
  | { type: 'stand'; label: 'Stand' }
  | { type: 'check'; label: 'Check' }
  | { type: 'call'; label: string; amount: number; allIn: boolean }
  | { type: 'raise'; label: 'Raise'; minTo: number }
  | { type: 'fold'; label: 'Fold' }

export type PlayerActionInput =
  | { type: 'stand' }
  | { type: 'check' }
  | { type: 'call'; intent?: 'confirm' | 'stand' }
  | { type: 'raise'; amount?: number; intent?: 'confirm' | 'stand' }
  | { type: 'fold' }
