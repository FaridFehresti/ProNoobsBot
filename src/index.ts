import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config/env.js';
import { registerInteractionHandler } from './events/interaction-create.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.info(`ProNoobs bot connected as ${readyClient.user.tag}`);
});

client.on(Events.Error, (error) => console.error('Discord client error:', error));
registerInteractionHandler(client);

await client.login(config.botToken);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void client.destroy();
    process.exit(0);
  });
}
