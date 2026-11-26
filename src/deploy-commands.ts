import { REST, Routes } from 'discord.js';
import { config } from './config/env.js';
import { commands } from './commands/index.js';

const rest = new REST({ version: '10' }).setToken(config.botToken);
const route = config.guildId
  ? Routes.applicationGuildCommands(config.applicationId, config.guildId)
  : Routes.applicationCommands(config.applicationId);

await rest.put(route, { body: commands.map((command) => command.data.toJSON()) });
console.info(`Deployed ${commands.length} slash commands${config.guildId ? ` to guild ${config.guildId}` : ' globally'}.`);
