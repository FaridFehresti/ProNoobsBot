import { playerCommand } from './player.js';
import { registrationCommand } from './registration.js';
import { teamCommand } from './team.js';
import { tournamentCommand } from './tournament.js';

export const commands = [tournamentCommand, teamCommand, registrationCommand, playerCommand];
export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
