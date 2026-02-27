import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zquypdnnyioxjokoknhp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CRco3eIgE2aB8CXdRut92g_lqIG308q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const newCigars = [
    {
        name: "Macanudo Cafe Ascot",
        brand: "Macanudo",
        origin: "Dominican Republic",
        wrapper: "Connecticut Shade",
        strength: "Mild",
        size: "4.18 x 32",
        rating: 88,
        price: "$21.50",
        notes: "A smooth, mild classic with notes of sweet hay, cream, and a hint of vanilla.",
        description: "Macanudo Cafe is one of the world's most popular premium cigars. Wrapped in a silky Connecticut shade leaf, it delivers an incredibly smooth and mellow smoking experience perfect for any time of day.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/mac/ci-mac-ascotn.jpg?_i=AB",
        tags: ["Mild", "Dominican", "Beginner-Friendly"],
        pairings: ["Morning Coffee", "Wheat Beer", "Chardonnay"]
    },
    {
        name: "Rocky Patel Vintage 1999",
        brand: "Rocky Patel",
        origin: "Honduras",
        wrapper: "Connecticut Shade",
        strength: "Mild",
        size: "5.5 x 50",
        rating: 90,
        price: "$10.50",
        notes: "Creamy, nutty, and slightly buttery with a refined finish.",
        description: "Featuring a 7-year-old Connecticut wrapper, this Vintage 1999 blend is elegant and complex without overwhelming the palate. Excellent morning or afternoon smoke.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/rpj/ci-rpj-junct.jpg?_i=AB",
        tags: ["Premium", "Mild"],
        pairings: ["Cappuccino", "Light Rum"]
    },
    {
        name: "Baccarat Rothschild",
        brand: "Baccarat",
        origin: "Honduras",
        wrapper: "Connecticut Shade",
        strength: "Mild",
        size: "5.0 x 50",
        rating: 86,
        price: "$6.00",
        notes: "Sweetened cap, mild tobacco core with notes of sugar and cedar.",
        description: "Famous for its sweetened cap, Baccarat brings a unique sweetness to a mellow Honduran blend. A very approachable and consistent everyday cigar.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/ci-bac-rotn.jpg?_i=AB",
        tags: ["Mild", "Beginner-Friendly"],
        pairings: ["Sweet Tea", "Cognac"]
    },
    {
        name: "Arturo Fuente Hemingway Short Story",
        brand: "Arturo Fuente",
        origin: "Dominican Republic",
        wrapper: "Cameroon",
        strength: "Medium",
        size: "4.0 x 49",
        rating: 94,
        price: "$9.50",
        notes: "Rich cedar, leather, and surprisingly sweet baking spices.",
        description: "A beautifully crafted Perfecto. The Hemingway Short Story is legendary for its flawless construction and rich, medium-bodied Cameroon flavor profile.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/af/CI-AF-HEAN-40-BOX_OPEN.jpg?_i=AB",
        tags: ["Iconic", "Premium", "Dominican"],
        pairings: ["Aged Rum", "Espresso", "Port Wine"]
    },
    {
        name: "Romeo y Julieta 1875 Bully",
        brand: "Romeo y Julieta",
        origin: "Dominican Republic",
        wrapper: "Indonesian",
        strength: "Medium",
        size: "5.0 x 50",
        rating: 91,
        price: "$8.00",
        notes: "Cedar, toasted nuts, and a delicate floral finish.",
        description: "The 1875 Bully is a staple in humidors worldwide. It offers a classic, balanced, medium-bodied profile that never goes out of style.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/roh/ci-roh-torn.jpg?_i=AB",
        tags: ["Iconic", "Dominican"],
        pairings: ["Cabernet Sauvignon", "Bourbon"]
    },
    {
        name: "Acid Blondie",
        brand: "Acid",
        origin: "Nicaragua",
        wrapper: "Connecticut Shade",
        strength: "Mild",
        size: "4.0 x 38",
        rating: 87,
        price: "$7.20",
        notes: "Intensely aromatic, floral, honey, and herbal botanicals.",
        description: "Infused with a secret blend of botanicals and oils, Acid Blondie is a unique, sweet, and highly aromatic smoking experience unlike traditional cigars.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/aci/ci-aci-bkconn.jpg?_i=AB",
        tags: ["Mild", "Nicaraguan"],
        pairings: ["Gin & Tonic", "Sparkling Water"]
    },
    {
        name: "Famous Nicaraguan 3000",
        brand: "Famous Smoke",
        origin: "Nicaragua",
        wrapper: "Ecuadorian Habano",
        strength: "Full",
        size: "6.0 x 52",
        rating: 89,
        price: "$4.50",
        notes: "Earth, dark cocoa, robust pepper, and leather.",
        description: "A house brand favorite offering incredible value. This Nicaraguan puro delivers a rich, bold, and full-bodied experience at an everyday price.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/fsw/ci-fsw-robn.jpg?_i=AB",
        tags: ["Bold", "Nicaraguan"],
        pairings: ["Stout Beer", "Strong Black Coffee"]
    },
    {
        name: "Baccarat Churchill",
        brand: "Baccarat",
        origin: "Honduras",
        wrapper: "Connecticut Shade",
        strength: "Mild",
        size: "7.0 x 50",
        rating: 85,
        price: "$7.50",
        notes: "Sweet gum cap, mild tobacco, creamy finish.",
        description: "An extended version of the classic Baccarat blend. Perfect for a long, relaxing, mellow afternoon smoke with a touch of sweetness.|||https://images.famous-smoke.com/image/upload/c_lpad,dpr_2.0,f_auto,h_300,q_auto,w_240/v1/skupics/bac/CI-BAC-CHUN-25-BOX.jpg?_i=AB",
        tags: ["Mild"],
        pairings: ["Iced Coffee", "Cream Ale"]
    }
];

async function seedData() {
    console.log('Seeding cigars to Supabase...');

    for (const cigar of newCigars) {
        const { data: existing } = await supabase
            .from('cigars')
            .select('id')
            .eq('name', cigar.name)
            .single();

        if (!existing) {
            const { error } = await supabase.from('cigars').insert([cigar]);
            if (error) {
                console.error(`Error inserting ${cigar.name}:`, error.message);
            } else {
                console.log(`Inserted ${cigar.name} successfully.`);
            }
        } else {
            console.log(`${cigar.name} already exists. Skipping.`);
        }
    }

    console.log('Done!');
}

seedData();
