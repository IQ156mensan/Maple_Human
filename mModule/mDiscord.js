const { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = {}


module.exports.generateButton = function (txt, id) {
    let button = new ActionRowBuilder();
    button.addComponents(
        new ButtonBuilder()
            .setCustomId('setNickName_' + id)
            .setStyle(ButtonStyle.Primary)
            .setLabel(txt),
    );
    return button
}