
const axios = require("axios");
const schedule = require('node-schedule');
const cheerio = require('cheerio');
const fs = require("fs")

const m = require("./mModule/mMensan")
const GuildDataManager = require("./mModule/MGuildData")
const GuestDataManager = require("./mModule/mGuestData")
const mDiscordManager = require("./mModule/mDiscord")

schedule.scheduleJob({ hour: 23, minute: 45 }, () => {
    GuildDataManager.sync()
});
schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
    GuildDataManager.getDatafromGG()
});

const channelPermissions = {
    "길드원": "949559912051122186",
    "손님": "949560034319298570",
    "방문자": "985828722844270592",
    "운영진": "985861758612824125"
}
// GuildDataManager.getDatafromGG()

// var current = GuildDataManager.getCurrentGuildData()

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers

    ],
    partials: [Partials.Channel],
});
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, AttachmentBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
client.on('ready', () => {
    m.addLog("Logged in as ", client.user.tag)
});

async function messageToButton(title, message) {
    var button = mDiscordManager.generateButton("메이플스토리 닉네임 입력하기", message.author.id)
    await message.reply({
        content: title,
        components: [button],
    });

}
// console.log(channelPermissions["길드원"])
async function chageRoule(member, guild, title) {
    try {
        await member.roles.remove(member.roles.cache)
        await member.roles.add(guild.roles.cache.get(channelPermissions[title]))
    }
    catch {

    }
}

client.on(Events.GuildMemberAdd, (message) => {
    if (message.author.bot) return;
    m.addLog(message.user.auther.id, "welcome message, Input Nickname")
    messageToButton("반갑습니다! " + message.author.username + "님!!\n메이플 스토리 닉네임을 입력 해 주세요!!", message)
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    // message.guild.roles.forEach(role => console.log(role.name, role.id))
    // console.log(message.channel.permissionOverwrites)
    if (message.content.startsWith("!닉네임") || message.content.startsWith("!slrspdla")) {
        messageToButton("메이플스토리 닉네임을 변경합니다! " + message.author.username + "님!!\n변경할 메이플 스토리 닉네임을 입력 해 주세요!", message)
        //    console.log(message.author)
        m.addLog(message.author.id, "(", message.author.username, ") request Input Nickname")

    }
    if (message.content.startsWith("!test")) {
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId.split("_")[0] == "setNickName") {
            if (interaction.customId === 'setNickName_' + interaction.user.id) {

                const modal = new ModalBuilder()
                    .setCustomId('setNickName_modal_' + interaction.user.id)
                    .setTitle('메이플스토리 닉네임을 알려주세요!')
                    .addComponents([
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('verification-input')
                                .setLabel('닉네임')
                                .setStyle(TextInputStyle.Short)
                                .setMinLength(2)
                                .setMaxLength(12)
                                .setPlaceholder('')
                                .setRequired(true),
                        ),
                    ]);

                await interaction.showModal(modal);

                m.addLog(interaction.user.id, "(", interaction.user.username, ") Yes I want to change Nickname")
            }
            else {
                var user = await interaction.message.guild.members.fetch(interaction.user.id)
                var button = mDiscordManager.generateButton("메이플스토리 닉네임 입력하기", interaction.user.id)

                m.addLog(interaction.message.author.id, "(", interaction.message.author.username, ") request Input Nickname by other's button")
                await interaction.message.channel.send({ content: `${user.toString()}:님! 메이플스토리 닉네임 변경을 원하시나요??`, components: [button] });
            }
        }
        if (interaction.customId.split("_")[0] == "correctNickName") {
            if (interaction.customId === 'correctNickName_' + interaction.user.id) {
                if (interaction.user["mapleUserData"]) {
                    var mData = interaction.user.mapleUserData
                    var member = await interaction.guild.members.fetch(interaction.user.id)
                    var newNic = ""
                    try {

                        var existUser = false
                        var findUser = await interaction.guild.members.fetch({ query: newNic })
                        for (var us of findUser)
                            existUser = us[1].nickname
                        if (existUser === newNic) {
                            m.addLog(interaction.user.id, "(", interaction.user.username, ") -> " + newNic + " Exist Nickname Err")
                            interaction.reply("이미 존재하는 닉네임 입니다!!")
                        }
                        else {
                            if (mData.son) {
                                newNic = mData.nickname + "/" + mData.job + "/" + mData.guild
                                if (mData.guild == "휴먼" && (mData.grade == "마스터" || mData.grade == "부마스터"))
                                    chageRoule(member, interaction.guild, "운영진")
                                else
                                    chageRoule(member, interaction.guild, "길드원")
                            }

                            else {
                                newNic = mData.nickname + "/(손님)"
                                chageRoule(member, interaction.guild, "손님")
                            }
                            await member.setNickname(newNic);
                            m.addLog(interaction.user.id, "(", interaction.user.username, ") change nickname clear")
                            interaction.reply("변경 완료 되었습니다!")


                        }

                    }
                    catch (e) {
                        m.addLog(interaction.user.id, "(", interaction.user.username, ") raise Exeption", e)
                        interaction.reply("알 수 없는 오류 입니다. 다시 진행 해 주세요")
                    }
                }
                else
                    interaction.reply("알 수 없는 오류 입니다. 다시 진행 해 주세요")
            }
            else {
                var user = await interaction.message.guild.members.fetch(interaction.user.id)
                var button = mDiscordManager.generateButton("메이플스토리 닉네임 입력하기", interaction.user.id)
                await interaction.message.channel.send({ content: `${user.toString()}:님! 메이플스토리 닉네임 변경을 원하시나요??`, components: [button] });
            }
        }
    }

    if (interaction.type === InteractionType.ModalSubmit) {

        if (interaction.customId === 'setNickName_modal_' + interaction.user.id) {
            const response =
                interaction.fields.getTextInputValue('verification-input');


            var user = await interaction.message.guild.members.fetch(interaction.user.id)
            var NickNameButton = mDiscordManager.generateButton("다시 입력합니다!", interaction.user.id)
            let CorrectButton = new ActionRowBuilder();
            CorrectButton.addComponents(
                new ButtonBuilder()
                    .setCustomId('correctNickName_' + interaction.user.id)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("네, 맞습니다!"),
            );



            var mapleUserData = GuildDataManager.getCurrentGuildData()[response]
            if (mapleUserData) {
                mapleUserData.son = true
            }
            else mapleUserData = { son: false, nickname: response }
            interaction.user.mapleUserData = mapleUserData
            var messageContent = `${user.toString()}:님! `
            if (mapleUserData.son) {
                messageContent += "```닉네임 : " + mapleUserData.nickname + "\n"
                messageContent += "길드 : " + mapleUserData.guild + "\n"

                if (mapleUserData.grade != "")
                    messageContent += "직위 : " + mapleUserData.grade + "\n"

                messageContent += "레벨 : " + mapleUserData.lv + "lv\n"
                messageContent += "직업 : " + mapleUserData.job + "\n```"
                messageContent += " 맞으신가요?? "
            }
            else {

                var mapleUserData = await GuestDataManager.getGuestDataFromGG(response)
                if (!mapleUserData.exist) {
                    await interaction.reply(mapleUserData.nickname + " 닉네임은 존재하지 않는 닉네임 입니다. 닉네임을 확인 해 보거나 잠시 후 다시 시도해보세요");
                    return
                }

                messageContent += "```닉네임 : " + mapleUserData.nickname + "\n"
                messageContent += "길드 : " + mapleUserData.guild + "\n"

                messageContent += "레벨 : " + mapleUserData.lv + "lv\n"
                messageContent += "직업 : " + mapleUserData.job + "\n```"

                messageContent += "휴먼 연합에 **손님**으로 입장 하신것이 맞으신가요?? "

            };

            m.addLog(interaction.user.id, "(", interaction.user.username, ") input nickname :", response, " get Data : level/job",
                mapleUserData.lv + "/" + mapleUserData.job, "  guild :" + mapleUserData.guild
            )
            var attachment = new AttachmentBuilder(mapleUserData.image, { name: 'userimage.png' })
            await interaction.reply({
                content: messageContent, components: [NickNameButton, CorrectButton],
                files: [attachment]
            });










            // var button = mDiscordManager.generateButton("메이플스토리 닉네임 입력하기", interaction.user.id)

            // var member = await interaction.guild.members.fetch(interaction.user.id)
            // member.setNickname("some nickname");

            // var currentGuildData = GuildDataManager.getCurrentGuildData()[response]
            // if (currentGuildData == null)
            //     interaction.reply(response + "")
            // else {
            //     interaction.reply(
            //         response + "(" +
            //         currentGuildData.lv + "Lv " + currentGuildData.job + ") 님 반갑습니다"

            //     );
            //     // interaction.guild.members.get(interaction.user.id).setNickname("some nickname");
            // }
        }
    }
});

client.login("MTA3NTA1MDg4MDQyMTg1NTMwMg.Glc3Y-.Vxppl56tuzQRuow4i2DHNgMuExd687g-OlwMSE");  