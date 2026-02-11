import type { Team } from '../team/team.type'

export type Match = {
    id: number
    tournamentId: number
    round: number
    position: number
    team1Id?: number
    team2Id?: number
    team1?: Team
    team2?: Team
    score1?: number
    score2?: number
    winnerId?: number
    winner?: Team
    status: 'pending' | 'completed'
}

export type UpdateMatchData = {
    score1: number
    score2: number
}

export type UpdateMatchResponse = Match & {
    tournament_completed?: boolean
    tournament_winner_id?: number
}
