const { ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, MessageFlags } = require("discord.js");

const storage = require('../helpers/storage');

const commandInfo = {
  type: ApplicationCommandType.ChatInput,
  description: 'Allows roles to be added to the roles commands.',
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: 'role',
      description: 'The role to be added.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'mainrole',
      description: 'Whether or not this is a main role.',
      required: false
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'emoji',
      description: 'Emoji to use for roles command.  DO NOT USE THIS UNLESS YOU KNOW WHAT YOU\'RE DOING!',
      required: false
    }
  ]
};

async function runCommand(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const role = interaction.options.get('role').role;
  const mainrole = interaction.options.get('mainrole').value;
  const emoji = interaction.options.get('emoji').value;

  let res, reply = '';

  if (mainrole) {
    res = storage.addGuildMainRole(interaction.guildId, role.id, emoji);
  } else {
    res = storage.addGuildRole(interaction.guildId, role.id, emoji);
  }

  if (res) {
    reply = 'Added role.';
  } else {
    reply = 'Failed to add role.';
  }

  await interaction.editReply({ content: reply, flags: MessageFlags.Ephemeral });
}

module.exports = { commandInfo, runCommand };