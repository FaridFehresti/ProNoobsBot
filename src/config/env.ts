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

function optionalSnowflake(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  if (!/^\d{17,20}$/.test(value)) throw new Error(`${name} must be a Discord snowflake ID.`);
  return value;
}

const apiUrl = required('PRONOOBS_API_URL').replace(/\/+$/, '');
if (!/^https?:\/\//.test(apiUrl)) throw new Error('PRONOOBS_API_URL must be an http(s) URL.');

export const config = {
  botToken: required('DISCORD_BOT_TOKEN'),
  applicationId: required('DISCORD_APPLICATION_ID'),
  guildId: optionalSnowflake('DISCORD_GUILD_ID'),
  apiUrl,
  apiKey: required('PRONOOBS_API_KEY'),
  adminRoleIds: optionalSnowflakes('DISCORD_ADMIN_ROLE_IDS'),
  broadcastChannelIds: optionalSnowflakes('DISCORD_BROADCAST_CHANNEL_IDS'),
  broadcastRoleIds: optionalSnowflakes('DISCORD_BROADCAST_ROLE_IDS'),
  broadcastUserIds: optionalSnowflakes('DISCORD_BROADCAST_USER_IDS'),
  registrationAnnouncementChannelId: optionalSnowflake('DISCORD_REGISTRATION_ANNOUNCEMENT_CHANNEL_ID'),
  teamCategoryId: optionalSnowflake('DISCORD_TEAM_CATEGORY_ID'),
  teamTextCategoryId: optionalSnowflake('DISCORD_TEAM_TEXT_CATEGORY_ID') ?? optionalSnowflake('DISCORD_TEAM_CATEGORY_ID'),
  teamVoiceCategoryId: optionalSnowflake('DISCORD_TEAM_VOICE_CATEGORY_ID') ?? optionalSnowflake('DISCORD_TEAM_CATEGORY_ID'),
  teamCaptainRoleId: optionalSnowflake('DISCORD_TEAM_CAPTAIN_ROLE_ID'),
  mmrAlertChannelId: optionalSnowflake('DISCORD_MMR_ALERT_CHANNEL_ID'),
  auditLogChannelId: optionalSnowflake('DISCORD_AUDIT_LOG_CHANNEL_ID'),
};
