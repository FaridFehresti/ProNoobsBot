import type { Team, Tournament } from '../api/types.js';
import { config } from '../config/env.js';

export function formatTournament(tournament: Tournament): string {
  const date = tournament.starts_at ? ` · ${new Date(tournament.starts_at).toLocaleString()}` : '';
  const limit = tournament.max_teams ? ` · ${tournament.max_teams} team limit` : '';
  return `**${tournament.name}** (#${tournament.id}) — ${tournament.status}${date}${limit}`;
}

export function formatTeam(team: Team): string {
  const members = team.members.map((member) => `${member.displayName} (${member.mmr} MMR)${member.isCaptain ? ' · captain' : ''}`).join(', ');
  const logo = team.logoUrl ? ` · [Logo](${new URL(team.logoUrl, `${config.apiUrl}/`).toString()})` : '';
  return `**${team.name}** (#${team.id}) — Captain: ${team.captainDiscordName ?? 'unknown'} — ${members || 'No roster'}${logo}`;
}

export function truncate(content: string, limit = 1_900): string {
  return content.length <= limit ? content : `${content.slice(0, limit - 3)}...`;
}
