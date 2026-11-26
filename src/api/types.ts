export type TournamentStatus = 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface Tournament {
  id: number | string;
  name: string;
  description: string;
  status: TournamentStatus;
  starts_at: string | null;
  registration_deadline: string | null;
  max_teams: number | null;
}

export interface Player {
  id: number | string;
  displayName: string;
  mmr: number;
  position: string | null;
  isCaptain: boolean;
}

export interface Team {
  id: number | string;
  name: string;
  captainDiscordName: string | null;
  captainAgreementAccepted: boolean;
  logoUrl: string | null;
  members: Player[];
}

export interface Registration {
  id: number | string;
  tournament_id: number | string;
  team_id: number | string;
  status: RegistrationStatus;
  registered_at: string;
}
