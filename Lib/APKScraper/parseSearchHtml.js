const cheerio = require('cheerio');

function parseSearchHtml(html) {
  const $ = cheerio.load(html);
  const searchResults = [];

  $('.l_item').each((index, element) => {
    const descriptionElement = $(element).find('.description');
    const descriptionText = descriptionElement.text().trim();

    // Check if descriptionText is not null
    if (descriptionText) {
      // Select the spans inside the description element
      const spans = descriptionElement.find('span');

      // Extract the text content of each span
      const downloads = $(spans[0]).text().trim();
      const rating = $(spans[1]).text().trim();
      const size = $(spans[2]).text().trim();

      const apps = {
        name: $(element).find('.name').text().trim(),
        url: 'https://apkcombo.com' + $(element).attr('href'),
        img: $(element).find('img').attr('data-src'),
        downloads: downloads,
        size: size,
        rating: rating,
      };

      searchResults.push(apps);
    } else {
      // Log an error or handle the case where the regular expression does not match
      console.error('Description format does not match:', descriptionText);
    }
  });

  const res = {
    author: "HACXK",
    data: {
        apks: searchResults
    }
  }

  return res;
}

module.exports = parseSearchHtml;
