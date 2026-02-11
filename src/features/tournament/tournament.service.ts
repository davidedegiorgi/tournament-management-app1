import type { Tournament, CreateTournamentData } from './tournament.type'
import { myFetch } from '@/lib/backend'
import myEnv from '@/lib/env'

// Trasforma i dati dal backend (snake_case) al frontend (camelCase)
function transformTournament(backendTournament: any): Tournament {
    return {
        id: backendTournament.id,
        name: backendTournament.name,
        date: backendTournament.date,
        location: backendTournament.location,
        status: backendTournament.status,
        winnerId: backendTournament.winner_id,
        winner: backendTournament.winner,
        createdAt: backendTournament.created_at,
    }
}

export class TournamentService {
    static async list(): Promise<Tournament[]> {
        const data = await myFetch<any[]>(`${myEnv.backendApiUrl}/tournaments`)
        return data.map(transformTournament)
    }

    static async get(id: number): Promise<Tournament> {
        const data = await myFetch<any>(`${myEnv.backendApiUrl}/tournaments/${id}`)
        return transformTournament(data)
    }

    static async create(data: CreateTournamentData): Promise<Tournament> {
        // Converti teamIds (camelCase) in team_ids (snake_case) per il backend
        const payload = {
            name: data.name,
            date: data.date,
            location: data.location,
            team_ids: data.teamIds,
        }
        
        const result = await myFetch<any>(`${myEnv.backendApiUrl}/tournaments`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        return transformTournament(result)
    }

    static async delete(id: number): Promise<void> {
        await myFetch<null>(`${myEnv.backendApiUrl}/tournaments/${id}`, { 
            method: 'DELETE' 
        })
    }
}
