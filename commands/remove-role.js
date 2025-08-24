const { ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, MessageFlags, InteractionContextType } = require("discord.js");

const storage = require('../helpers/storage');

const commandInfo = {
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  description: 'Allows roles to be removed from the roles commands.',
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: 'role',
      description: 'The role to be removed.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'mainrole',
      description: 'Whether or not this is a main role.',
      required: false
    }
  ]
};

async function runCommand(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const role = interaction.options.get('role').role;
  const mainrole = interaction.options.get('mainrole').value;

  let res, reply = '';

  if (mainrole) {
    res = storage.removeGuildMainRole(interaction.guildId, role.id);
  } else {
    res = storage.removeGuildRole(interaction.guildId, role.id);
  }

  if (res) {
    reply = 'Removed role.';
  } else {
    reply = 'Failed to remove role.';
  }

  await interaction.editReply({ content: reply, flags: MessageFlags.Ephemeral });
}

module.exports = { commandInfo, runCommand };