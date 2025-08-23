const fs = require('fs');

let guildStorage = {};

function loadStorage() {
  if (!fs.existsSync('./store/botData.json')) {
    return;
  }

  guildStorage = JSON.parse(fs.readFileSync('./store/botData.json'));
}

function saveStorage() {
  fs.writeFileSync('./store/botData.json', JSON.stringify(guildStorage));
}

function addGuildRole(guildId, roleId, emojiId) {
  if (!guildStorage[guildId]) {
    guildStorage[guildId] = {};
  }

  if (!guildStorage[guildId].roles) {
    guildStorage[guildId].roles = [];
  }

  if (!guildStorage[guildId].roles.some((role) => role.id == roleId)) {
    const newRole = { id: roleId };

    if (emojiId) {
      newRole.emoji = emojiId;
    }

    guildStorage[guildId].roles.push(newRole);

    saveStorage();

    return true;
  } else {
    return false;
  }
}

function addGuildMainRole(guildId, roleId, emojiId) {
  if (!guildStorage[guildId]) {
    guildStorage[guildId] = {};
  }

  if (!guildStorage[guildId].mainRoles) {
    guildStorage[guildId].mainRoles = [];
  }

  if (!guildStorage[guildId].mainRoles.some((role) => role.id == roleId)) {
    const newRole = { id: roleId };

    if (emojiId) {
      newRole.emoji = emojiId;
    }

    guildStorage[guildId].mainRoles.push(newRole);

    saveStorage();

    return true;
  } else {
    return false;
  }
}

function removeGuildRole(guildId, roleId) {
  if (!guildStorage[guildId] || !guildStorage[guildId].roles) {
    return false;
  }

  guildStorage[guildId].roles = guildStorage[guildId].roles.filter((role) => { return role.id !== roleId });

  if (guildStorage[guildId].roles.length < 1 && guildStorage[guildId].mainRoles.length < 1) {
    delete guildStorage[guildId];
  }

  saveStorage();

  return true;
}

function removeGuildMainRole(guildId, roleId) {
  if (!guildStorage[guildId] || !guildStorage[guildId].mainRoles) {
    return false;
  }

  guildStorage[guildId].mainRoles = guildStorage[guildId].mainRoles.filter((role) => { return role.id !== roleId });

  if (guildStorage[guildId].mainRoles.length < 1 && guildStorage[guildId].roles.length < 1) {
    delete guildStorage[guildId];
  }

  saveStorage();

  return true;
}

function getGuildRoles(guildId) {
  if (!guildStorage[guildId] || !guildStorage[guildId].roles) {
    return [];
  }

  return guildStorage[guildId].roles;
}

function getGuildMainRoles(guildId) {
  if (!guildStorage[guildId] || !guildStorage[guildId].mainRoles) {
    return [];
  }

  return guildStorage[guildId].mainRoles;
}

module.exports = { loadStorage, addGuildRole, addGuildMainRole, removeGuildRole, removeGuildMainRole, getGuildRoles, getGuildMainRoles };