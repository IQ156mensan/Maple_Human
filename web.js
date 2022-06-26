const axios = require('axios');
const cheerio = require('cheerio');

const getHtml = async () => {
    try {
        return await axios.get('https://maplestory.nexon.com/Common/Guild?gid=12458&wid=46');
    } catch (error) {
        console.error(error);
    }
};


async function test() {
    var test = await getHtml()
    var $ = cheerio.load(test.data)
    var table = $('div.guild_user_list table.rank_table tbody tr')

    let ulList = [];
    console.log(table[0])
    table.each(function (i, elem) {
        ulList[i] = {
            nickname: $(this).find('td.left dl dt a').text(),
            Job: $(this).find('td.left dl dd').text(),
            LV: $(this).find('td:nth-of-type(3)').text().slice(3)
        };
    });

    for (var i = 0; i < 10; i++)
        console.log(ulList[i])
}
test()