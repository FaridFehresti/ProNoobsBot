import { PermissionFlagsBits, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config/env.js';

export async function canManageTournament(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  if (config.adminRoleIds.length === 0 || !interaction.guild) return false;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  return member.roles.cache.some((role) => config.adminRoleIds.includes(role.id));
}
