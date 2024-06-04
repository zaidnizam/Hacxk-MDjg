const axios = require('axios');

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

async function fetchHtml(url) {
    try {
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

module.exports = fetchHtml;
