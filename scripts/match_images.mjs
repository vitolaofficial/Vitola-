import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeImageForCigar(page, brand, name) {
    // Search Cigars International
    const query = encodeURIComponent(`${brand} ${name}`);
    const searchUrl = `https://www.cigarsinternational.com/shop/?q=${query}`;

    try {
        console.log(`Searching for: ${brand} ${name}...`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await delay(3000); // let it render

        const content = await page.content();
        const $ = cheerio.load(content);

        let imageUrl = null;

        // Find the first product image
        const productImgs = $('.product-image img, .product-card img, .c-product-card img, .c-product-image img');

        productImgs.each((i, el) => {
            let src = $(el).attr('src') || $(el).attr('data-src');
            // Filter out placeholder images or loaders
            if (src && !src.includes('loader') && !src.includes('pixel') && !src.includes('data:image')) {
                imageUrl = src;
                return false; // break loop
            }
        });

        if (imageUrl) {
            // Ensure absolute URL
            if (!imageUrl.startsWith('http')) {
                imageUrl = `https://www.cigarsinternational.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            // Remove sizing queries to get highest quality
            imageUrl = imageUrl.split('?')[0];
            return imageUrl;
        }

        return null;
    } catch (err) {
        console.error(`Failed to scrape ${name}:`, err.message);
        return null;
    }
}

async function run() {
    console.log('Fetching cigars from Supabase...');
    const { data: cigars, error } = await supabase
        .from('cigars')
        .select('id, name, brand');

    if (error) {
        console.error('Error fetching cigars:', error);
        return;
    }

    const imagesFile = 'src/data/cigar_images.json';
    let localImages = {};
    if (fs.existsSync(imagesFile)) {
        localImages = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
    }

    const cigarsToScrape = cigars.filter(c => !localImages[c.id]).slice(0, 30); // batch size 30

    console.log(`Found ${cigarsToScrape.length} cigars without locally mapped images in this batch.`);
    if (cigarsToScrape.length === 0) return;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    for (const cigar of cigarsToScrape) {
        const imageUrl = await scrapeImageForCigar(page, cigar.brand, cigar.name);
        if (imageUrl) {
            console.log(`✅ Found image for ${cigar.name}: ${imageUrl}`);
            localImages[cigar.id] = imageUrl;
            fs.writeFileSync(imagesFile, JSON.stringify(localImages, null, 2));
        } else {
            console.log(`❌ No image found for ${cigar.brand} ${cigar.name}`);
        }
        await delay(1500 + Math.random() * 1000); // Be respectful
    }

    await browser.close();
    console.log('Batch complete!');
}

run();
