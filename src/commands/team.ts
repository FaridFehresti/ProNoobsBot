import { SlashCommandBuilder } from 'discord.js';
import { pronoobsApi } from '../api/client.js';
import { formatTeam, truncate } from './format.js';
import type { BotCommand } from './types.js';

const data = new SlashCommandBuilder()
  .setName('team')
  .setDescription('View and register ProNoobs teams')
  .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List teams and rosters'))
  .addSubcommand((subcommand) => {
    subcommand.setName('create').setDescription('Create a team and roster')
      .addStringOption((option) => option.setName('name').setDescription('Team name').setRequired(true).setMaxLength(120));
    for (let member = 1; member <= 5; member += 1) {
      const required = member === 1;
      subcommand
        .addStringOption((option) => option.setName(`member${member}_name`).setDescription(`Member ${member} display name`).setRequired(required).setMaxLength(120))
        .addIntegerOption((option) => option.setName(`member${member}_mmr`).setDescription(`Member ${member} MMR`).setRequired(required).setMinValue(0).setMaxValue(100_000));
    }
    return subcommand;
  });

export const teamCommand: BotCommand = {
  data,
  adminOnly: ['create'],
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'list') {
      const teams = await pronoobsApi.listTeams();
      await interaction.editReply({ content: teams.length ? truncate(teams.map(formatTeam).join('\n')) : 'No teams registered yet.' });
      return;
    }

    const members = [];
    for (let index = 1; index <= 5; index += 1) {
      const displayName = interaction.options.getString(`member${index}_name`);
      const mmr = interaction.options.getInteger(`member${index}_mmr`);
      if (displayName === null && mmr === null) continue;
      if (displayName === null || mmr === null) {
        await interaction.editReply({ content: `Provide both a name and MMR for member ${index}.` });
        return;
      }
      if (members.length !== index - 1) {
        await interaction.editReply({ content: 'Fill team member slots in order, starting at member 1.' });
        return;
      }
      members.push({ displayName, mmr, ...(index === 1 ? { discordId: interaction.user.id, isCaptain: true } : {}) });
    }

    const team = await pronoobsApi.createTeam({ name: interaction.options.getString('name', true), members });
    await interaction.editReply({ content: `Team created: ${formatTeam(team)}` });
  },
};
