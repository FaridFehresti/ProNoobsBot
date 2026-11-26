import { Events, type ChatInputCommandInteraction, type Client, type Interaction } from 'discord.js';
import { ApiError } from '../api/client.js';
import { commandMap } from '../commands/index.js';
import { canManageTournament } from '../commands/permissions.js';

export function registerInteractionHandler(client: Client): void {
  client.on(Events.InteractionCreate, (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    void handleCommand(interaction).catch(async (error: unknown) => {
      console.error('Command failed:', error);
      const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again later.';
      if (interaction.deferred) await interaction.editReply({ content: message }).catch(() => undefined);
      else if (interaction.replied) await interaction.followUp({ content: message, ephemeral: true }).catch(() => undefined);
      else await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
    });
  });
}

async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });
  const command = commandMap.get(interaction.commandName);
  if (!command) {
    await interaction.editReply({ content: 'That command is not available.' });
    return;
  }
  const subcommand = interaction.options.getSubcommand();
  const adminOnly = command.adminOnly === true ||
    (Array.isArray(command.adminOnly) && command.adminOnly.includes(subcommand));
  if (adminOnly && !(await canManageTournament(interaction))) {
    await interaction.editReply({ content: 'You need tournament admin permission to use this command.' });
    return;
  }
  await command.execute(interaction);
}
