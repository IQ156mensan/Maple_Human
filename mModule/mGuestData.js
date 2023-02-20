
const axios = require("axios");
const cheerio = require('cheerio');
const fs = require("fs")
const m = require("./mMensan.js")


//https://maple.gg/u/%EA%B9%80%EB%A9%98%EC%82%B0


module.exports = {}

module.exports.getGuestDataFromGG = async function (nickname) {
    var fileDir = "./WebData/Guest/"
    var fileNameWeb = nickname + "_web_data.txt"

    if (!fs.existsSync(fileDir))
        fs.mkdirSync(fileDir);


    console.log("get Guest Data One", nickname)

    var html = await axios.get("https://maple.gg/u/" + nickname);
    fs.writeFileSync(fileDir + fileNameWeb, html.data)

    html = fs.readFileSync(fileDir + fileNameWeb)
    const $ = cheerio.load(html);



    var image = $("#user-profile > section > div.row.row-normal > div.col-lg-4.pt-1.pt-sm-0.pb-1.pb-sm-0.text-center.mt-2.mt-lg-0 > div > div.col-6.col-md-8.col-lg-6 > img").attr('src');
    var nickname = $("#user-profile > section > div.row.row-normal > div.col-lg-8 > h3 > b").text();
    var job = $("#user-profile > section > div.row.row-normal > div.col-lg-8 > div.user-summary > ul > li:nth-child(2)").text();
    var level = $("#user-profile > section > div.row.row-normal > div.col-lg-8 > div.user-summary > ul > li:nth-child(1)").text();
    var guild = $("#user-profile > section > div.row.row-normal > div.col-lg-8 > div.row.row-normal.user-additional > div.col-lg-2.col-md-4.col-sm-4.col-12.mt-3 > a").text();
    
    if (nickname == "")
        return {
            exist: false,
            nickname
        }
    return {
        exist: true,
        guild,
        image,
        nickname,
        job,
        lv: level.split(".")[1].split('(')[0]
    }
}