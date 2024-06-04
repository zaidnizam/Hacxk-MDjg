const axios = require('axios');

// Expanded list of User-Agents
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
];

const referers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://search.yahoo.com/',
    'https://www.baidu.com/'
];

const acceptLanguages = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'en-CA,en;q=0.9',
    'en-AU,en;q=0.9'
];

async function fetchHtml(url) {
    try {
        // Rotate User-Agent, Referer, and Accept-Language
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const referer = referers[Math.floor(Math.random() * referers.length)];
        const acceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];

        const headers = {
            'User-Agent': userAgent,
            'Accept-Language': acceptLanguage,
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': referer,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'DNT': '1', // Do Not Track Request Header
            'Upgrade-Insecure-Requests': '1',
            'TE': 'Trailers' // Indicates the client supports HTTP/2 features
        };

        const response = await axios.get(url, {
            headers: headers,
            timeout: 10000 // Timeout after 10 seconds
        });

        if (response.status === 200) {
            return response.data;
        } else {
            console.error(`Error: Received status code ${response.status}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Introduce a delay function to mimic human behavior
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function(url) {
    await delay(Math.floor(Math.random() * 5000) + 1000); // Delay between 1-6 seconds
    return fetchHtml(url);
};
