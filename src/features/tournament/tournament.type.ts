import type { Team } from '../team/team.type'

export type Tournament = {
    id: number
    name: string
    date: string
    location: string
    status: 'pending' | 'in_progress' | 'completed'
    winnerId?: number
    winner?: Team
    createdAt: string
}

export type CreateTournamentData = {
    name: string
    date: string
    location: string
    teamIds: number[]
}
