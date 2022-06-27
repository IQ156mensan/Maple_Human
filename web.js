const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');







async function test() {

    let driver = await new webdriver.Builder().forBrowser(webdriver.Browser.FIREFOX).build();

    driver.get("https://maplestory.nexon.com/Authentication/Login#a")
}


test()