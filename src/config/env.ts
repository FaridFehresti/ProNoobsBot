import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optionalSnowflakes(name: string): string[] {
  const values = (process.env[name] ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  if (values.some((value) => !/^\d{17,20}$/.test(value))) {
    throw new Error(`${name} must contain comma-separated Discord snowflake IDs.`);
  }
  return values;
}

const apiUrl = required('PRONOOBS_API_URL').replace(/\/+$/, '');
if (!/^https?:\/\//.test(apiUrl)) throw new Error('PRONOOBS_API_URL must be an http(s) URL.');

export const config = {
  botToken: required('DISCORD_BOT_TOKEN'),
  applicationId: required('DISCORD_APPLICATION_ID'),
  guildId: process.env.DISCORD_GUILD_ID?.trim() || undefined,
  apiUrl,
  apiKey: required('PRONOOBS_API_KEY'),
  adminRoleIds: optionalSnowflakes('DISCORD_ADMIN_ROLE_IDS'),
};
