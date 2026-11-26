# ProNoobs Discord Bot

TypeScript Discord bot for managing ProNoobs tournaments through the [ProNoobs API](https://github.com/FaridFehresti/ProNoobsBackend). Slash commands use the backend's public read routes and its API-key-protected write routes. The bot only needs Discord's `Guilds` gateway intent.

## Requirements

- Node.js 24.17.0 or later (required by the current discord.js release)
- pnpm
- A Discord application and bot token
- A running ProNoobs API with an `ADMIN_API_KEY`

## Setup

```bash
pnpm install
Copy-Item .env.example .env
```

Fill in `.env`:

- `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID` come from the Discord Developer Portal.
- `DISCORD_GUILD_ID` is optional. Set it to your server ID for fast guild command updates; leave blank for global registration.
- `PRONOOBS_API_URL` is the website origin `https://pronoobs.com` (no `/api` suffix; the bot adds `/api` to requests).
- `PRONOOBS_API_KEY` must match the backend's `ADMIN_API_KEY`.
- `DISCORD_ADMIN_ROLE_IDS` is an optional comma-separated list of role IDs allowed to run write commands. Discord server administrators are always allowed. If no role IDs are configured, only server administrators can write.
- The provided guild, application, admin role, announcement channel, registration channel, and team category IDs are prefilled in `.env.example`. Successful-registration notices currently target the announcement channel. The MMR alert channel and captain role remain unset.
- Channel/category/role IDs for planned registration and broadcast workflows are listed in [`docs/DISCORD_SETUP_CHECKLIST.md`](docs/DISCORD_SETUP_CHECKLIST.md). They are optional until those workflows are enabled.

Register slash commands, then run the bot:

```bash
pnpm deploy:commands
pnpm dev
```

For production:

```bash
pnpm build
pnpm start
```

Invite the bot with the `bot` and `applications.commands` OAuth scopes. No message content intent or channel permissions are needed for these interaction-only commands.

## Commands

- `/tournament list` and `/tournament show` — view tournament details.
- `/tournament create` and `/tournament status` — create tournaments and update status, including opening registration (admin only).
- `/team list`, `/team create`, and `/team logo` — inspect teams, create a five-player roster with MMR and captain agreement, or upload/replace a PNG, JPEG, or WebP logo (maximum 5 MB). Team writes are admin only.
- `/registration submit` and `/registration status` — submit a team to an open tournament and update entry status.
- `/player mmr` — update a player's MMR.

Write commands check the caller's administrator permission or an allowed admin role before using the API key. Replies are ephemeral. The bot never sends the backend key to Discord or includes it in error output.

## Architecture

- `src/commands/` defines slash commands and delegates work to the API client.
- `src/events/` handles Discord interactions and translates errors into safe replies.
- `src/api/` contains the backend client and API response types.
- `src/config/` validates configuration at startup.
- `src/deploy-commands.ts` registers commands independently of the running gateway client.

The bot maintains the Discord Gateway connection and calls the API over HTTP. Keep the bot running as a supervised service so it reconnects after restarts. The API does not hold the Discord bot token; when the website admin panel needs to trigger Discord actions, the API and bot will need a durable job/outbox flow for the bot to consume.
