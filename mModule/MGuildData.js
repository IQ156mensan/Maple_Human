
const axios = require("axios");
const cheerio = require('cheerio');
const fs = require("fs")
const m = require("./mMensan.js")

module.exports = {}

const guildList = ["휴먼", "낫휴먼", "논휴먼", "비휴먼", "언휴먼"]

if (!fs.existsSync("./WebData"))
    fs.mkdirSync("./WebData");

function getDate(day = 0) {
    var date = m.getPassTime(day).split(" ")[0].split('.')
    return date.join("_")
}
async function syncOne(guildName, fileDir, fileName) {
    console.log("sync One", guildName)
    var sync = await axios.get("https://maple.gg/guild/reboot2/" + guildName + "/sync");
    if (sync.data.done !== true) {
        setTimeout(async function () { await syncOne(guildName, fileDir, fileName) }, 5000)
    }
    fs.writeFileSync(fileDir + guildName + fileName, JSON.stringify(sync.data))
}

function getLastData(day = 0) {
    var fileDir = "./WebData/"
    if (!fs.existsSync(fileDir))
        return null
    fileDir = fileDir + getDate(day) + "/"

    var fileNameGuild = "_guildData.txt"

    if (!fs.existsSync(fileDir))
        return getLastData(day + 1)
    else {
        return JSON.parse(fs.readFileSync(fileDir + fileNameGuild))
    }
}

module.exports.getCurrentGuildData = function () {
    // var obj = JSON.parse(fs.readFileSync(""))
    return getLastData()

}

module.exports.sync = async function () {
    var fileDir = "./WebData/" + getDate() + "/"
    var fileName = "_sync.txt"

    if (!fs.existsSync(fileDir))
        fs.mkdirSync(fileDir);

    for (var i = 0; i < guildList.length; i++) {
        var guildName = guildList[i]
        await syncOne(guildName, fileDir, fileName)
    }
}


module.exports.getDatafromGG = async function () {
    var fileDir = "./WebData/" + getDate() + "/"
    var fileNameWeb = "_web_data.txt"
    var fileNameGuild = "_guildData.txt"

    if (!fs.existsSync(fileDir))
        fs.mkdirSync(fileDir);

    var guildAllData = {}

    for (var i = 0; i < guildList.length; i++) {
        var guildName = guildList[i]

        console.log("get Data One", guildName)

        var html = await axios.get("https://maple.gg/guild/reboot2/" + guildName + "/members");

        fs.writeFileSync(fileDir + guildName + fileNameWeb, html.data)
        html = fs.readFileSync(fileDir + guildName + fileNameWeb)
        const $ = cheerio.load(html);

        let ulList = {};

        // #guild-content > section > div.mb-4.row.text-center > div:nth-child(1) > section > div.mb-2 > a > img
        // #guild-content > section > div.mb-4.row.text-center > div:nth-child(1) > section > div.member-grade.is-master > div > div:nth-child(1)
        // #guild-content > section > div.mb-4.row.text-center > div:nth-child(1) > section > div.member-grade.is-master > div > div:nth-child(2) > span

        var bodyList = $("body > section > div.mb-4 > div");
        bodyList.map((i, element) => {
            var image = $(element).find("div.mb-2 img").attr('src')
            var grad = $(element).find("header").text().replace(/\s/g, "")
            var nickname = $(element).find("div.mb-2 a").text().replace(/\s/g, "")
            var joblevel = $(element).find("div.mb-2 span").text().replace(/\s/g, "").split("/")
            var whal = $(element).find("span.user-summary-date").text().replace(/\s/g, "").split(":")[1].split("일")[0]
            ulList[nickname] = {
                nickname,
                guild: guildName,
                image,
                job: joblevel[0],
                lv: parseInt(joblevel[1].split('.')[1]),
                grade: grad,
                whal: isNaN(parseInt(whal)) ? -1 : parseInt(whal),
            };
        });

        // #guild-content > section > div:nth-child(5) > div:nth-child(6) > section > div:nth-child(1) > a > img
        bodyList = $("section > div > div > section");
        bodyList.map((i, element) => {
            var image = $(element).find("div a img").attr("src")
            var nickname = $(element).find("div.mb-2 a").text().replace(/\s/g, "")
            var joblevel = $(element).find("div.mb-2 span").text().replace(/\s/g, "").split("/")
            var whal = $(element).find("span.user-summary-date").text().replace(/\s/g, "").split(":")[1].split("일")[0]
            if (ulList[nickname]) {
            }
            else {
                ulList[nickname] = {
                    nickname,
                    guild: guildName,
                    image,
                    job: joblevel[0],
                    lv: parseInt(joblevel[1].split('.')[1]),
                    grade: "",
                    whal: isNaN(parseInt(whal)) ? -1 : parseInt(whal),
                };
            }
        });
        fs.writeFileSync(fileDir + guildName + fileNameGuild, JSON.stringify(ulList))
        var nics = Object.keys(ulList)
        for (var k = 0; k < nics.length; k++) {
            var n = nics[k]
            if (!guildAllData[n])
                guildAllData[n] = ulList[n]
        }
    }
    fs.writeFileSync(fileDir + fileNameGuild, JSON.stringify(guildAllData))
}