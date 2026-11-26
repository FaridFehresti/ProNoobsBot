import { SlashCommandBuilder } from 'discord.js';
import { pronoobsApi } from '../api/client.js';
import type { BotCommand } from './types.js';

export const playerCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Update player records')
    .addSubcommand((subcommand) => subcommand.setName('mmr').setDescription('Update a player MMR')
      .addStringOption((option) => option.setName('player_id').setDescription('Player ID').setRequired(true))
      .addIntegerOption((option) => option.setName('mmr').setDescription('New MMR').setRequired(true).setMinValue(0).setMaxValue(100_000))),
  adminOnly: true,
  async execute(interaction) {
    const player = await pronoobsApi.updatePlayerMmr(
      interaction.options.getString('player_id', true),
      interaction.options.getInteger('mmr', true),
    );
    await interaction.editReply({ content: `Updated player #${player.id} to ${player.mmr} MMR.` });
  },
};
