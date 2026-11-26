# ProNoobs Discord Setup Checklist

Gather these values before enabling automatic registration, role/channel provisioning, MMR alerts, and announcements. Put secrets in the deployment secret store or `.env`; never commit them or send them in chat.

## Discord application and access

- [x] Discord Application ID — `DISCORD_APPLICATION_ID` = `1575472988059607050`.
- [ ] Bot token — `DISCORD_BOT_TOKEN` (already required; keep secret).
- [x] Discord server (guild) ID — `DISCORD_GUILD_ID` = `830477450336665670`.
- [ ] Bot invited with the `bot` and `applications.commands` OAuth scopes.
- [ ] Bot has `Manage Roles`, `Manage Channels`, `View Channels`, `Send Messages`, `Read Message History`, and `Embed Links` in the ProNoobs server.
- [ ] Move the bot's highest role above the team roles and captain role it must create or assign.
- [x] Admin role IDs allowed to create teams, broadcast, and change tournament settings — `DISCORD_ADMIN_ROLE_IDS` = `1187076129698365490`.

## Channel and role IDs

- [x] General announcement channel — `DISCORD_ANNOUNCEMENT_CHANNEL_ID` = `1540396583265239141`.
- [x] Registration/sign-up channel — `DISCORD_REGISTRATION_CHANNEL_ID` = `1540396648750911609`.
- [x] Registration notices currently use the general announcement channel — `DISCORD_REGISTRATION_ANNOUNCEMENT_CHANNEL_ID` = `1540396583265239141`.
- [x] Team text and voice channels share the provided team communication category — `DISCORD_TEAM_CATEGORY_ID` = `1574003539997499523`.
- [ ] Create a global role named `Team Captain` and set its ID as `DISCORD_TEAM_CAPTAIN_ROLE_ID`. It does not need special permissions; keep it below the bot's highest role.
- [x] MMR-over-cap alert channel is not needed yet — leave `DISCORD_MMR_ALERT_CHANNEL_ID` blank.
- [ ] Admin action/audit log channel — `DISCORD_AUDIT_LOG_CHANNEL_ID`.
- [x] Broadcasts may target any channel the bot can access — leave `DISCORD_BROADCAST_CHANNEL_IDS` blank.
- [ ] Optional role allowlist for broadcasts — `DISCORD_BROADCAST_ROLE_IDS` (comma-separated).
- [ ] Optional user allowlist for broadcasts — `DISCORD_BROADCAST_USER_IDS` (comma-separated).
- [x] One category is used for team text and voice channels; separate IDs can override it later.
- [ ] Confirm channel permissions: team members can view/connect; server admins can view/manage; everyone else is denied.
- [ ] Confirm whether existing channels/roles with the same team name should be reused, reconciled, or reported for manual review.

## Registration data and automation decisions

- [ ] Collect each player's Discord user ID, not only a username. Discord IDs let the bot assign roles even if a user changes their name. The bot can capture teammates with Discord user options; update the website form/API submission to provide them too. Keep the captain's Discord ID as well as the captain name shown on the form.
- [ ] Confirm whether players who are not in the server may register, and how their team role is assigned if they join later.
- [ ] Confirm the team role naming rule and channel naming rule. Names should be normalized and collisions handled.
- [ ] Confirm that the team-specific role is assigned to all roster members found in the server, while the global captain role is assigned to the registering captain.
- [ ] Confirm the announcement text and whether it includes a team logo, roster, captain, and average MMR.
- [ ] Confirm what should happen when a registration is withdrawn, rejected, or a member is replaced: remove roles/channels, archive them, or leave them for admins.

## MMR policy

- [ ] Set an average MMR cap per tournament.
- [ ] Confirm the rule: average is the sum of the five roster MMR values divided by five; only averages strictly above the cap are flagged.
- [ ] Confirm the alert destination and which admins should receive the alert.
- [ ] Confirm whether missing/invalid MMR blocks registration. The current plan is to require all five MMR values, allow registration over the cap, and flag over-cap teams for admin review.

## Admin broadcasts

- [ ] List roles and channels admins may target, or confirm that admins may choose any role/channel in the server.
- [ ] Confirm who can broadcast (reuse the admin role IDs or provide a separate role list).
- [ ] Confirm whether broadcasts may mention users/roles and which roles are mentionable.
- [ ] Blank broadcast role/user allowlists mean admins can target any role or user; add IDs only if you want to restrict those targets.
- [ ] Confirm whether a user-targeted announcement should be sent by DM or posted in a channel. DMs can be blocked by a member's privacy settings.
- [ ] Decide whether to give the bot permission to mention all roles or restrict it to roles explicitly marked mentionable.
- [ ] Decide whether a preview and confirmation step is required before sending.
- [ ] Choose the audit log channel and what to record: admin, target, message, and send result.

## Hosting and integration

- [ ] Provide a persistent service host for the bot and API with automatic restart and logs.
- [ ] Keep the Discord token and API key in environment secrets, not source code.
- [ ] Keep API logo uploads on persistent storage using `UPLOAD_DIR`.
- [ ] Before the website admin panel controls Discord actions, add a durable API job/outbox that the connected bot can consume and safely retry.

## Configuration keys

The optional Discord IDs above are parsed and validated by the bot startup configuration. They are startup defaults for now; the automatic role/channel creation, announcement, broadcast, and MMR-alert flows are not implemented yet. The future admin panel should store editable operational settings in the database and publish jobs to the bot instead of requiring source changes or restarts for routine edits.
