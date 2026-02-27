import { createClient } from '@supabase/supabase-js';
import { image_search } from 'duckduckgo-images-api';
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
    const query = `${brand} ${name} cigar stick`;
    try {
        console.log(`Searching DDG Images for: ${query}...`);
        const results = await image_search({ query, moderate: true });

        if (results && results.length > 0) {
            // Find a good vertical/cigar looking image
            for (const res of results) {
                const img = res.image;
                if (img && !img.includes('pixel') && !img.includes('svg')) {
                    // Pre-filter: mostly we just trust the first solid image from DDG
                    return img;
                }
            }
        }
        return null;
    } catch (err) {
        console.error(`Failed to search DDG for ${name}:`, err.message);
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
        await delay(1500); // Wait between queries to avoid rate limits
    }

    console.log('Batch complete!');
}

run();
