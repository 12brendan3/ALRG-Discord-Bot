const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, InteractionContextType } = require("discord.js");

const storage = require('../helpers/storage');

const commandInfo = {
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  description: 'Provides a menu to opt into a main role.'
};

async function runCommand(interaction) {
  const roles = storage.getGuildMainRoles(interaction.guildId);

  if (roles.length < 1) {
    await interaction.reply({ content: 'This guild has no opt-in main roles!', flags: MessageFlags.Ephemeral });
    return;
  }

  const buttonRows = [];

  let row = new ActionRowBuilder();

  for (let i = 0; i < roles.length; i++) {
    const role = await interaction.member.guild.roles.fetch(roles[i].id);

    const button = new ButtonBuilder().setCustomId('mainrole_' + roles[i].id).setLabel(role.name);

    if (interaction.member.roles.cache.has(roles[i].id)) {
      button.setStyle(ButtonStyle.Success);
    } else {
      button.setStyle(ButtonStyle.Danger);
    }

    if (roles[i].emoji) {
      button.setEmoji(roles[i].emoji);
    }

    row.addComponents(button);

    if ((i + 1) % 5 == 0) {
      buttonRows.push(row);

      row = new ActionRowBuilder();
    }
  }

  if (roles.length % 5 != 0) {
    buttonRows.push(row);
  }

  await interaction.reply({ content: 'Here\'s the available main roles:', components: buttonRows, flags: MessageFlags.Ephemeral });
}

module.exports = { commandInfo, runCommand };