import { config } from '../config/env.js';
import type { Registration, RegistrationStatus, Team, Tournament, TournamentStatus } from './types.js';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class PronoobsApi {
  private async request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body) headers.set('Content-Type', 'application/json');
    if (authenticated) headers.set('X-API-Key', config.apiKey);

    let response: Response;
    try {
      response = await fetch(`${config.apiUrl}/api${path}`, {
        ...init,
        headers,
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ApiError('The tournament API is unavailable right now.', 503);
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof payload === 'object' && payload !== null && 'error' in payload &&
        typeof payload.error === 'string' ? payload.error : 'The tournament API returned an error.';
      throw new ApiError(message, response.status);
    }
    return payload as T;
  }

  listTournaments(): Promise<Tournament[]> {
    return this.request('/tournaments');
  }

  getTournament(id: string): Promise<Tournament> {
    return this.request(`/tournaments/${encodeURIComponent(id)}`);
  }

  createTournament(input: {
    name: string;
    description: string;
    startsAt: string | null;
    maxTeams: number | null;
  }): Promise<Tournament> {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify({ ...input, status: 'upcoming' }),
    }, true);
  }

  updateTournamentStatus(id: string, status: TournamentStatus): Promise<Tournament> {
    return this.request(`/tournaments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  }

  listTeams(): Promise<Team[]> {
    return this.request('/teams');
  }

  createTeam(input: { name: string; members: Array<{
    displayName: string;
    mmr: number;
    discordId?: string;
    isCaptain?: boolean;
  }> }): Promise<Team> {
    return this.request('/teams', { method: 'POST', body: JSON.stringify(input) }, true);
  }

  registerTeam(tournamentId: string, teamId: string): Promise<Registration> {
    return this.request(`/tournaments/${encodeURIComponent(tournamentId)}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    }, true);
  }

  updateRegistration(id: string, status: RegistrationStatus): Promise<Registration> {
    return this.request(`/registrations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  }

  updatePlayerMmr(id: string, mmr: number): Promise<{ id: number | string; mmr: number }> {
    return this.request(`/players/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ mmr }),
    }, true);
  }
}

export const pronoobsApi = new PronoobsApi();
