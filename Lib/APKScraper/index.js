const fetchHtml = require('./fetchHtml');
const parseHtml = require('./parseHtml');
const parseSearchHtml = require('./parseSearchHtml');
const { parseSearchUrl } = require('./parseSearchUrl');

const urlFirstPage = 'https://apkcombo.com/';

async function hacxkApkCategory(option) {
    const html = await fetchHtml(urlFirstPage);
    if (html) {
        const categories = parseHtml(html, option);
        console.log(JSON.stringify(categories, null, 4));
    }
}

async function hacxkApkSearch(query) {
    if (!query) {
        return 'Please provide an APK name';
    }
    const apkName = query.replace(' ', '-');
    const searchUrl = `https://apkcombo.com/search/${encodeURIComponent(apkName)}`;
    const html = await fetchHtml(searchUrl);
    if (html) {
        const searchResults = parseSearchHtml(html);
       // console.log(JSON.stringify(searchResults, null, 4));
        return searchResults
    }
}

async function hacxkApkInfo(url) {
    if (!url) {
        return 'Please provide an APK URL';
    }

    const html = await fetchHtml(url);
    if (html) {
        const apkInfo = await parseSearchUrl(html, url);
      //  console.log(JSON.stringify(apkInfo, null, 4));
        return apkInfo
    }
}


module.exports = {
    hacxkApkCategory,
    hacxkApkSearch,
    hacxkApkInfo
};

