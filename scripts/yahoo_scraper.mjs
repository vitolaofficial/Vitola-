import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
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

async function scrapeImageForCigar(brand, name) {
    // Add specific keywords to ensure we get a cigar stick, not people or random things.
    const query = encodeURIComponent(`${brand} ${name} cigar stick or box transparent`);
    const searchUrl = `https://images.search.yahoo.com/search/images?p=${query}`;

    try {
        console.log(`Searching Yahoo Images for: ${brand} ${name}...`);
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        const $ = cheerio.load(response.data);
        let imageUrl = null;

        // Yahoo Image results usually have an <li> with a 'data' attribute or just an image
        // Let's grab the first non-tracker image
        $('#sres li').each((i, el) => {
            let img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            // Try extracting high-res URL if present in JSON attribute
            const aTagData = $(el).find('a').attr('data');
            if (aTagData) {
                try {
                    const parsed = JSON.parse(aTagData);
                    if (parsed && parsed.iurl) {
                        imageUrl = parsed.iurl;
                        return false; // Break
                    }
                } catch (e) { }
            }
            if (img && img.startsWith('http')) {
                imageUrl = img;
                return false; // Break
            }
        });

        return imageUrl;
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

    const cigarsToScrape = cigars.filter(c => !localImages[c.id]).slice(0, 50); // Get next 50

    console.log(`Found ${cigarsToScrape.length} cigars without locally mapped images in this batch.`);
    if (cigarsToScrape.length === 0) return;

    for (const cigar of cigarsToScrape) {
        const imageUrl = await scrapeImageForCigar(cigar.brand, cigar.name);
        if (imageUrl) {
            console.log(`✅ Found image for ${cigar.name}: ${imageUrl}`);
            localImages[cigar.id] = imageUrl;
            fs.writeFileSync(imagesFile, JSON.stringify(localImages, null, 2));
        } else {
            console.log(`❌ No image found for ${cigar.brand} ${cigar.name}`);
        }
        await delay(2000); // 2 seconds between requests
    }

    console.log('Batch complete!');
}

run();
