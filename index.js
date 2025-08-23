const { Client, InteractionType, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
var readline = require('readline');

const storage = require('./helpers/storage');

const client = new Client({intents:[ 'Guilds' ]}); // Guilds intent is needed to properly check guild/user roles.

const commands = new Map();

const rl = readline.createInterface(process.stdin, process.stdout);

const defaultConfig = {
  apiKey: 'REPLACEME'
};

if (!fs.existsSync('./store')) {
  fs.mkdirSync('./store');
}

if (!fs.existsSync('./store/config.json')) {
  fs.writeFileSync('./store/config.json', JSON.stringify(defaultConfig, null, 2));
  console.error('No config file found, a default one has been generated.\nPlease edit the file before attempting to run the bot again.');
  process.exit(69);
}

const config = JSON.parse(fs.readFileSync('./store/config.json'));

storage.loadStorage();

client.on('clientReady', () => {
  console.info(`Logged in as ${client.user.tag}!`);

  registerCommands();
});

client.on('interactionCreate', (interaction) => {
  handleInteraction(interaction);
});

client.login(config.apiKey);

rl.setPrompt('> ');

rl.on('line', (command) => {
  if (command == 'exit') {
    client.destroy();
    console.info('Bye bye!');
    process.exit();
  }

  console.error('Unknown command!');
});

async function registerCommands() {
  console.info('Scanning and registering commands....');

  const commandFiles = fs.readdirSync('./commands');

  const newCommands = [];

  for (let i = 0; i < commandFiles.length; i++) {
    const commandName = commandFiles[i].replace('.js', '');

    const requiredCommand = require('./commands/' + commandName);

    const newCommand = requiredCommand.commandInfo;

    newCommand.name = commandName;

    commands.set(commandName, requiredCommand);
    
    newCommands.push(newCommand);
  }

  try {
    await client.application.commands.set(newCommands);
  } catch (err) {
    console.error('There was an error registering the commands.\n' + err);

    return;
  }

  console.info('Commands registered.');
}

function handleInteraction(interaction) {
  if (interaction.type == InteractionType.ApplicationCommand && commands.has(interaction.commandName)) {
    commands.get(interaction.commandName).runCommand(interaction);
  } else if (interaction.type == InteractionType.MessageComponent && interaction.customId.startsWith('role_')) {
    changeRole(interaction);
  } else if (interaction.type == InteractionType.MessageComponent && interaction.customId.startsWith('mainrole_')) {
    changeMainRole(interaction);
  }
}

async function changeRole(interaction) {
  const content = interaction.message.content;
  const components = interaction.message.components;
  const roleId = interaction.customId.substring(5);

  let index1 = -1;
  let index2 = -1;
  let found = false;
  for(let i = 0; i < components.length; i++) {
    const btnComp = components[i].components;

    for (let y = 0; y < btnComp.length; y++) {
      if (btnComp[y].customId == interaction.customId) {
        index2 = y;
        found = true;
        break;
      }
    }

    if (found) {
      index1 = i;
      break;
    }
  }

  if (index1 < 0 || index2 < 0) {
    await interaction.reply({ content: 'There was an error processing your request.', flags: MessageFlags.Ephemeral });
    return;
  }

  if (components[index1].components[index2].data.style == ButtonStyle.Success) {
    interaction.member.roles.remove(roleId, 'Requested role removal.');
    components[index1].components[index2].data.style = ButtonStyle.Danger;
  } else {
    interaction.member.roles.add(roleId, 'Requested role addition.');
    components[index1].components[index2].data.style = ButtonStyle.Success;
  }

  await interaction.update({ content, components, flags: MessageFlags.Ephemeral });
}

async function changeMainRole(interaction) {
  const content = interaction.message.content;
  const components = interaction.message.components;
  const roleId = interaction.customId.substring(9);

  let index1 = -1;
  let index2 = -1;
  let addingRole = true;

  for(let i = 0; i < components.length; i++) {
    const btnComp = components[i].components;

    for (let y = 0; y < btnComp.length; y++) {
      if (btnComp[y].customId == interaction.customId) {
        index1 = i;
        index2 = y;

        if (btnComp[y].data.style == ButtonStyle.Success) {
          addingRole = false;
        }
      }

      components[i].components[y].data.style = ButtonStyle.Danger;
    }
  }

  const guildRoles = storage.getGuildMainRoles(interaction.guildId);

  if (index1 < 0 || index2 < 0 || guildRoles.length < 1) {
    await interaction.reply({ content: 'There was an error processing your request.', flags: MessageFlags.Ephemeral });
    return;
  }

  const removedRoles = [];

  for (let i = 0; i < guildRoles.length; i++) {
    if (addingRole && roleId == guildRoles[i].id) {
      continue;
    }

    if (interaction.member.roles.cache.has(guildRoles[i].id)) {
      removedRoles.push(guildRoles[i].id);
    }
  }

  if (removedRoles.length > 0) {
    interaction.member.roles.remove(removedRoles, 'Requested main role removal.');
  }

  if (addingRole) {
    interaction.member.roles.add(roleId, 'Requested main role addition.');
    components[index1].components[index2].data.style = ButtonStyle.Success;
  }

  await interaction.update({ content, components, flags: MessageFlags.Ephemeral });
}