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
    const query = encodeURIComponent(`${brand} ${name} cigar box transparent stick png`);
    const searchUrl = `https://www.bing.com/images/search?q=${query}`;

    try {
        console.log(`Searching Bing Images for: ${brand} ${name}...`);
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        let imageUrl = null;

        // Bing Images usually stores data in `<a class="iusc" m="... murl: 'link' ... ">`
        $('a.iusc').each((i, el) => {
            const m = $(el).attr('m');
            if (m) {
                try {
                    const parsed = JSON.parse(m);
                    if (parsed && parsed.murl && !parsed.murl.includes('pixel') && !parsed.murl.includes('svg')) {
                        imageUrl = parsed.murl;
                        return false; // Break
                    }
                } catch (e) { }
            }
        });

        if (!imageUrl) {
            $('img.mimg').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.startsWith('http')) {
                    imageUrl = src;
                    return false;
                }
            });
        }

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

    const cigarsToScrape = cigars.filter(c => !localImages[c.id]).slice(0, 50);

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
        await delay(1500); // Wait between queries
    }

    console.log('Batch complete!');
}

run();
