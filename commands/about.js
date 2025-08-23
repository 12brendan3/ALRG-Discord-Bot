const { ApplicationCommandType, MessageFlags, EmbedBuilder } = require("discord.js");
const { readFileSync } = require('fs');

const commandInfo = {
  type: ApplicationCommandType.ChatInput,
  description: 'Provides information about the bot.'
};

async function runCommand(interaction) {
  const embed = new EmbedBuilder();

  const packageInfo = JSON.parse(readFileSync('package.json'));

  embed.setTimestamp();
  embed.setColor('#18AFDD');

  embed.setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL()});

  const embedFields = [];

  embedFields.push({ name: '__About__', value: 'The ALRG bot is written in JS using the Discord.js library.' });

  embedFields.push({ name: '__Current Maintainer__', value: '• [Brendan Root](https://github.com/12brendan3)' });

  embedFields.push({ name: '__GitHub Repo__', value: '[ALRG-Discord-Bot](https://github.com/12brendan3/ALRG-Discord-Bot)' });

  embed.setFields(embedFields);

  embed.setFooter({text: packageInfo.version});

  interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

module.exports = { commandInfo, runCommand };