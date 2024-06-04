const cheerio = require('cheerio');
const axios = require('axios');
const validUrl = require('valid-url');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Referer': 'https://www.google.com/',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'DNT': '1', // Do Not Track Request Header
  'Upgrade-Insecure-Requests': '1',
  'TE': 'Trailers' // Indicates the client supports HTTP/2 features
};


async function parseSearchUrl(html, downloadLink) {
    if (!downloadLink || !validUrl.isUri(downloadLink)) {
        return 'Please provide a valid download URL';
    }

    const $ = cheerio.load(html);

    // Extracting app name
    const appName = $('.app_name h1 a').text().trim();

    // Extracting version
    const version = $('.version').text().trim();

    // Extracting author
    const author = $('.author a').text().trim();

    // Extracting screenshots URLs
    const screenshots = [];
    $('.gallery a').each((index, element) => {
        const screenshotUrl = $(element).attr('href');
        screenshots.push(screenshotUrl);
    });

    // Extracting latest version information
    const latestVersion = {
        version: $('.information-table .name:contains("Version")').next('.value').text().trim(),
        update: $('.information-table .name:contains("Update")').next('.value').text().trim(),
        developer: $('.information-table .name:contains("Developer")').next('.value').find('a').text().trim(),
        category: $('.information-table .name:contains("Category")').next('.value').find('a').text().trim(),
        googlePlayID: $('.information-table .name:contains("Google Play ID")').next('.value').find('a').attr('href'),
        installs: $('.information-table .name:contains("Installs")').next('.value').text().trim()
    };

    const response = await axios.get(downloadLink + '/download/apk#google_vignette', {
        headers: headers,
        timeout: 10000 // Timeout after 10 seconds
    });

    const $$ = await cheerio.load(response.data);

    let dlLink
    if ($$) {
    // Execute your logic after loading the HTML content
        const contentTab = $$('.content-tab.content-tab-latest-version');
        const link = contentTab.find('a.variant').attr('href');

        if (link.endsWith('&lang=en')) {
            dlLink = link + '&fp=cdcb604f3311bb35a7f3a6438bddfd55&ip=103.253.25.57';
        } else if (link.startsWith('/r2?')) {
            dlLink = 'https://apkcombo.com' + link;
        } else {
            dlLink = null;
        }
    }
    try {

        const res = {
            author: "HACXK",
            data: {
                appName: appName,
                version: version,
                author: author,
                screenshots: screenshots,
                downloadLink: dlLink,
                latestVersion: latestVersion
            }
        }

        return res;
    } catch (error) {
        console.error('Error fetching download link:', error);
        return null; // Return null if there's an error
    }
}

module.exports = { parseSearchUrl };
