import { SlashCommandBuilder } from 'discord.js';
import { pronoobsApi } from '../api/client.js';
import type { RegistrationStatus } from '../api/types.js';
import type { BotCommand } from './types.js';

const statuses: RegistrationStatus[] = ['pending', 'approved', 'rejected', 'withdrawn'];

export const registrationCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('registration')
    .setDescription('Register teams and manage tournament entries')
    .addSubcommand((subcommand) => subcommand.setName('submit').setDescription('Register a team for a tournament')
      .addStringOption((option) => option.setName('tournament_id').setDescription('Tournament ID').setRequired(true))
      .addStringOption((option) => option.setName('team_id').setDescription('Team ID').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('status').setDescription('Update an entry status')
      .addStringOption((option) => option.setName('registration_id').setDescription('Registration ID').setRequired(true))
      .addStringOption((option) => option.setName('status').setDescription('New status').setRequired(true)
        .addChoices(...statuses.map((status) => ({ name: status, value: status })))),
  adminOnly: true,
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'submit') {
      const registration = await pronoobsApi.registerTeam(
        interaction.options.getString('tournament_id', true),
        interaction.options.getString('team_id', true),
      );
      await interaction.editReply({ content: `Team registered with entry #${registration.id} (${registration.status}).` });
      return;
    }
    const registration = await pronoobsApi.updateRegistration(
      interaction.options.getString('registration_id', true),
      interaction.options.getString('status', true) as RegistrationStatus,
    );
    await interaction.editReply({ content: `Entry #${registration.id} is now ${registration.status}.` });
  },
};
