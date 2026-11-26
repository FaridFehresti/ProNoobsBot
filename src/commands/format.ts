import type { Team, Tournament } from '../api/types.js';

export function formatTournament(tournament: Tournament): string {
  const date = tournament.starts_at ? ` · ${new Date(tournament.starts_at).toLocaleString()}` : '';
  const limit = tournament.max_teams ? ` · ${tournament.max_teams} team limit` : '';
  return `**${tournament.name}** (#${tournament.id}) — ${tournament.status}${date}${limit}`;
}

export function formatTeam(team: Team): string {
  const members = team.members.map((member) => `${member.displayName} (${member.mmr} MMR)${member.isCaptain ? ' · captain' : ''}`).join(', ');
  return `**${team.name}** (#${team.id}) — ${members || 'No roster'}`;
}

export function truncate(content: string, limit = 1_900): string {
  return content.length <= limit ? content : `${content.slice(0, limit - 3)}...`;
}
