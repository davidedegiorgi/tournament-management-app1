import { myFetch } from '@/lib/backend';
import myEnv from '@/lib/env';
import type { Team, CreateTeamData, UpdateTeamData } from './team.type';

export class TeamService {
  static async list(): Promise<Team[]> {
    return await myFetch<Team[]>(`${myEnv.backendApiUrl}/teams`);
  }

  static async get(id: number): Promise<Team> {
    return await myFetch<Team>(`${myEnv.backendApiUrl}/teams/${id}`);
  }

  static async create(data: CreateTeamData): Promise<Team> {
    return await myFetch<Team>(`${myEnv.backendApiUrl}/teams`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async update({ id, data }: { id: number; data: UpdateTeamData }): Promise<Team> {
    console.log('🔵 Updating team:', id, data);
    const result = await myFetch<Team>(`${myEnv.backendApiUrl}/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    console.log('🟢 Update response:', result);
    return result;
  }

  static async delete(id: number): Promise<void> {
    console.log('🔵 Deleting team:', id);
    await myFetch<null>(`${myEnv.backendApiUrl}/teams/${id}`, {
      method: 'DELETE'
    });
    console.log('🟢 Delete successful');
  }
}

// Alias per backward compatibility
export const teamService = {
  getAll: TeamService.list,
  list: TeamService.list,
  getById: TeamService.get,
  create: TeamService.create,
  update: (id: number, data: UpdateTeamData) => TeamService.update({ id, data }),
  delete: TeamService.delete,
};