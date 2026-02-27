import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeCigars() {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    console.log('Navigating to famous-smoke.com/cigars...');

    try {
        await page.goto('https://www.famous-smoke.com/cigars', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('Page loaded. Simulating scroll...');
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 2000));

        const content = await page.content();
        fs.writeFileSync('scripts/debug.html', content);
        console.log('Saved page HTML to scripts/debug.html');

        const $ = cheerio.load(content);
        const results = [];

        const productCards = $('.product-item, .card, article, [data-qa="product-card"]');
        console.log(`Found ${productCards.length} potential product cards.`);

        productCards.each((i, el) => {
            if (results.length >= 20) return false;
            const $el = $(el);

            const textMatches = $el.text().replace(/\s+/g, ' ').trim();
            const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || $el.find('img').first().attr('srcset');

            if (image && textMatches.length > 5 && !image.includes('loader') && !image.includes('pixel')) {
                results.push({
                    rawText: textMatches.substring(0, 100),
                    image: image
                });
            }
        });

        console.log(`Successfully extracted ${results.length} basic entries.`);
        // Save to a local JSON file
        fs.writeFileSync('src/data/famous_smoke_cigars.json', JSON.stringify(results, null, 2));
        console.log('Saved to src/data/famous_smoke_cigars.json');

    } catch (error) {
        console.error('Error during scraping:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeCigars();
