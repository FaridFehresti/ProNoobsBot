import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface BotCommand {
  data: SlashCommandBuilder;
  adminOnly?: boolean | string[];
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
