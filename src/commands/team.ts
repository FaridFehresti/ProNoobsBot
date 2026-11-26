import { SlashCommandBuilder } from 'discord.js';
import { pronoobsApi } from '../api/client.js';
import { config } from '../config/env.js';
import { formatTeam, truncate } from './format.js';
import type { BotCommand } from './types.js';

const data = new SlashCommandBuilder()
  .setName('team')
  .setDescription('View and register ProNoobs teams')
  .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List teams and rosters'))
  .addSubcommand((subcommand) => subcommand.setName('logo').setDescription('Upload or replace a team logo')
    .addStringOption((option) => option.setName('team_id').setDescription('Team ID').setRequired(true))
    .addAttachmentOption((option) => option.setName('image').setDescription('PNG, JPEG, or WebP image (max 5 MB)').setRequired(true)))
  .addSubcommand((subcommand) => {
    subcommand.setName('create').setDescription('Create a team and roster')
      .addStringOption((option) => option.setName('name').setDescription('Team name').setRequired(true).setMaxLength(120));
    for (let member = 1; member <= 5; member += 1) {
      subcommand
        .addStringOption((option) => option.setName(`member${member}_name`).setDescription(`Member ${member} Steam/Dota name`).setRequired(true).setMaxLength(120))
        .addIntegerOption((option) => option.setName(`member${member}_mmr`).setDescription(`Member ${member} MMR`).setRequired(true).setMinValue(0).setMaxValue(100_000));
      if (member > 1) {
        subcommand.addUserOption((option) => option.setName(`member${member}_discord_user`)
          .setDescription(`Member ${member} Discord account, if they are in the server`));
      }
    }
    subcommand.addBooleanOption((option) => option.setName('accept_captain_agreement')
      .setDescription('Accept captain responsibility, fair play and MMR rules, and organizer communication')
      .setRequired(true));
    return subcommand;
  });

export const teamCommand: BotCommand = {
  data,
  adminOnly: ['create', 'logo'],
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'list') {
      const teams = await pronoobsApi.listTeams();
      await interaction.editReply({ content: teams.length ? truncate(teams.map(formatTeam).join('\n')) : 'No teams registered yet.' });
      return;
    }

    if (interaction.options.getSubcommand() === 'logo') {
      const attachment = interaction.options.getAttachment('image', true);
      if (attachment.size > 5 * 1024 * 1024 ||
          !['image/png', 'image/jpeg', 'image/webp'].includes(attachment.contentType ?? '')) {
        await interaction.editReply({ content: 'Choose a PNG, JPEG, or WebP image no larger than 5 MB.' });
        return;
      }
      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error('Could not download the Discord attachment.');
      const image = await response.blob();
      const result = await pronoobsApi.uploadTeamLogo(
        interaction.options.getString('team_id', true), image, attachment.name,
      );
      await interaction.editReply({ content: `Logo uploaded for team #${result.id}: ${new URL(result.logoUrl, `${config.apiUrl}/`).toString()}` });
      return;
    }

    if (!interaction.options.getBoolean('accept_captain_agreement', true)) {
      await interaction.editReply({ content: 'The team cannot be created unless the captain agreement is accepted.' });
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
      const discordId = index === 1
        ? interaction.user.id
        : interaction.options.getUser(`member${index}_discord_user`)?.id;
      members.push({
        displayName,
        mmr,
        ...(discordId ? { discordId } : {}),
        ...(index === 1 ? { isCaptain: true } : {}),
      });
    }

    const team = await pronoobsApi.createTeam({
      name: interaction.options.getString('name', true),
      captainDiscordName: interaction.user.globalName ?? interaction.user.username,
      captainAgreementAccepted: true,
      members,
    });
    await interaction.editReply({ content: `Team created: ${formatTeam(team)}` });
  },
};
