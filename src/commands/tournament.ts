import { SlashCommandBuilder } from 'discord.js';
import { pronoobsApi } from '../api/client.js';
import type { TournamentStatus } from '../api/types.js';
import { formatTournament, truncate } from './format.js';
import type { BotCommand } from './types.js';

const statuses: TournamentStatus[] = ['upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'];

export const tournamentCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('View and manage ProNoobs tournaments')
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List tournaments'))
    .addSubcommand((subcommand) => subcommand.setName('show').setDescription('Show a tournament')
      .addStringOption((option) => option.setName('id').setDescription('Tournament ID').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a tournament')
      .addStringOption((option) => option.setName('name').setDescription('Tournament name').setRequired(true).setMaxLength(120))
      .addStringOption((option) => option.setName('starts_at').setDescription('Start time in ISO 8601 format, for example 2026-12-01T18:00:00Z'))
      .addIntegerOption((option) => option.setName('max_teams').setDescription('Maximum number of teams').setMinValue(1))
      .addStringOption((option) => option.setName('description').setDescription('Short description').setMaxLength(2_000)))
    .addSubcommand((subcommand) => subcommand.setName('status').setDescription('Update tournament status')
      .addStringOption((option) => option.setName('id').setDescription('Tournament ID').setRequired(true))
      .addStringOption((option) => option.setName('status').setDescription('New status').setRequired(true)
        .addChoices(...statuses.map((status) => ({ name: status.replaceAll('_', ' '), value: status })))),
  adminOnly: ['create', 'status'],
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'list') {
      const tournaments = await pronoobsApi.listTournaments();
      await interaction.editReply({ content: tournaments.length ? truncate(tournaments.map(formatTournament).join('\n')) : 'No tournaments yet.' });
      return;
    }
    if (subcommand === 'show') {
      const tournament = await pronoobsApi.getTournament(interaction.options.getString('id', true));
      await interaction.editReply({ content: formatTournament(tournament) });
      return;
    }
    if (subcommand === 'create') {
      const name = interaction.options.getString('name', true);
      const startsAt = interaction.options.getString('starts_at');
      if (startsAt && Number.isNaN(Date.parse(startsAt))) {
        await interaction.editReply({ content: 'Start time must be a valid ISO 8601 date and time.' });
        return;
      }
      const tournament = await pronoobsApi.createTournament({
        name,
        description: interaction.options.getString('description') ?? '',
        startsAt,
        maxTeams: interaction.options.getInteger('max_teams'),
      });
      await interaction.editReply({ content: `Created: ${formatTournament(tournament)}` });
      return;
    }
    const id = interaction.options.getString('id', true);
    const status = interaction.options.getString('status', true) as TournamentStatus;
    const tournament = await pronoobsApi.updateTournamentStatus(id, status);
    await interaction.editReply({ content: `Updated: ${formatTournament(tournament)}` });
  },
};
