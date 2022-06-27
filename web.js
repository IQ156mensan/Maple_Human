

const chromium = require('chromium');
const chromedriver = require('chromedriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());


async function test() {
    let options = new chrome.Options();
    options.setChromeBinaryPath(chromium.path);
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    
    const driver = await new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    await driver.get("https://maplestory.nexon.com/Authentication/Login#a")
}


test()