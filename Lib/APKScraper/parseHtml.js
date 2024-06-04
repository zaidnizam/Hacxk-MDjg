const cheerio = require('cheerio');

function parseHtml(html, option) {
    if (!option) {
        return 'Please Provide a option 1, 2, etc.'
    }
    const $ = cheerio.load(html);
    const categories = {};

    function parseSection(section) {
        const apps = [];
        $(section).find('.content-apps a').each((index, element) => {
            const app = {
                name: $(element).find('p').first().text(),
                url: $(element).attr('href'),
                img: $(element).find('img').attr('data-src'),
            };
            apps.push(app);
        });
        return apps;
    }

    const optionMap = {
        1: 'Games · Hot',
        2: 'Apps · Hot',
        3: 'Games · Latest Updates',
        4: 'Apps · Latest Updates',
        5: 'Games · New Releases',
        6: 'Apps · New Releases'
    };

    const selectedCategory = optionMap[option];

    $('.item-section-anchor').each((index, element) => {
        const categoryTitle = $(element).find('h2.title').text();
        if (categoryTitle.includes(selectedCategory)) {
            const section = $(element).next('.content-apps');
            categories[selectedCategory.replace(' · ', '_').replace(' ', '_')] = parseSection(section);
        }
    });

    return categories;
}

module.exports = parseHtml;
