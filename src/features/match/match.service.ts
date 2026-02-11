import type { Match, UpdateMatchData, UpdateMatchResponse } from './match.type'
import { myFetch } from '@/lib/backend'
import myEnv from '@/lib/env'

// Trasforma i dati dal backend (snake_case) al frontend (camelCase)
function transformMatch(backendMatch: any): Match {
    return {
        id: backendMatch.id,
        tournamentId: backendMatch.tournament_id,
        round: backendMatch.round,
        position: backendMatch.match_number - 1, // Backend usa match_number (1-based), frontend usa position (0-based)
        team1Id: backendMatch.team1_id,
        team2Id: backendMatch.team2_id,
        team1: backendMatch.team1,
        team2: backendMatch.team2,
        score1: backendMatch.team1_score,
        score2: backendMatch.team2_score,
        winnerId: backendMatch.winner_id,
        winner: backendMatch.winner,
        status: backendMatch.status,
    }
}

export class MatchService {
    static async getMatches(tournamentId: number): Promise<Match[]> {
        const data = await myFetch<any[]>(`${myEnv.backendApiUrl}/tournaments/${tournamentId}/matches`)
        return data.map(transformMatch)
    }

    static async updateMatch(_tournamentId: number, matchId: number, data: UpdateMatchData): Promise<UpdateMatchResponse> {
        // Converti i nomi dei campi per il backend
        const backendData = {
            team1_score: data.score1,
            team2_score: data.score2
        }
        const result = await myFetch<any>(`${myEnv.backendApiUrl}/matches/${matchId}`, {
            method: 'PUT',
            body: JSON.stringify(backendData)
        })
        return {
            ...transformMatch(result),
            tournament_completed: result.tournament_completed,
            tournament_winner_id: result.tournament_winner_id,
        }
    }
}