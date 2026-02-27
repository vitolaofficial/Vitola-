export type PairingCategory = 'wine' | 'whiskey' | 'rum' | 'coffee' | 'chocolate' | 'tea' | 'spirits';
export type Occasion = "Morning" | "Relaxing" | "Celebration" | "Evening";

export interface FlavorProfile {
    spice: number;   // 0-10
    sweet: number;   // 0-10
    earth: number;   // 0-10
    cream: number;   // 0-10
    wood: number;    // 0-10
    body: number;    // 0-10 (Intensity)
}

export interface PairingSuggestion {
    category: PairingCategory;
    title: string;
    subtitle: string;
    description: string;
    whyItWorks: string;
    sommelierTip: string;
    icon: string;
    synergyScore: number; // calculated 0-100
    profileMatch: Partial<FlavorProfile>;
}

export interface ReversePairing {
    title: string;
    idealProfile: string;
    whyItWorks: string;
    sommelierTip: string;
    suggestedTags: string[];
    profile?: FlavorProfile;
}

/**
 * Maps common cigar notes to a numeric flavor profile
 */
function analyzeCigarProfile(strength: string, notes: string): FlavorProfile {
    const s = strength.toLowerCase();
    const n = notes.toLowerCase();

    const profile: FlavorProfile = {
        spice: 2, sweet: 2, earth: 2, cream: 2, wood: 2,
        body: s.includes('full') ? 9 : s.includes('medium') ? 5 : 3
    };

    if (n.includes('pepper') || n.includes('spice')) profile.spice += 5;
    if (n.includes('cinnamon')) profile.spice += 2;
    if (n.includes('chocolate') || n.includes('caramel') || n.includes('sweet')) profile.sweet += 5;
    if (n.includes('fruit')) profile.sweet += 3;
    if (n.includes('earth') || n.includes('leather') || n.includes('soil')) profile.earth += 5;
    if (n.includes('coffee') || n.includes('toast')) profile.earth += 3;
    if (n.includes('cream') || n.includes('butter') || n.includes('milk')) profile.cream += 5;
    if (n.includes('nut')) profile.cream += 3;
    if (n.includes('cedar') || n.includes('wood') || n.includes('oak')) profile.wood += 5;

    return profile;
}

/**
 * Main pairing logic: Matches cigar profile to predefined beverage profiles
 */
export function getSmartPairings(strength: string, notes: string): PairingSuggestion[] {
    const cigarProfile = analyzeCigarProfile(strength, notes);
    const suggestions: PairingSuggestion[] = [];

    const beverageProfiles: (PairingSuggestion & { profile: FlavorProfile })[] = [
        {
            category: 'wine',
            title: 'Cabernet Sauvignon',
            subtitle: 'Bold & Tannic',
            description: 'Heavy tannins and dark fruit notes.',
            whyItWorks: 'The structural tannins act as a palate cleanser for the heavy oils in bold cigars.',
            sommelierTip: 'Let it breathe for 30 minutes to soften the oak before your first puff.',
            icon: 'Wine',
            synergyScore: 0,
            profileMatch: { body: 9, wood: 7, earth: 6 },
            profile: { spice: 4, sweet: 3, earth: 7, cream: 2, wood: 7, body: 9 }
        },
        {
            category: 'whiskey',
            title: 'Peated Islay Malt',
            subtitle: 'Smoky & Intense',
            description: 'Ocean sea-salt and dense peat smoke.',
            whyItWorks: 'The medicinal smoke profile provides a "dense" atmospheric match for robust tobaccos.',
            sommelierTip: 'Add three drops of spring water to unlock the hidden vanilla notes.',
            icon: 'GlassWater',
            synergyScore: 0,
            profileMatch: { body: 10, wood: 8, spice: 7 },
            profile: { spice: 8, sweet: 2, earth: 6, cream: 1, wood: 9, body: 10 }
        },
        {
            category: 'coffee',
            title: 'Sumatran Mandheling',
            subtitle: 'Earthy & Low Acid',
            description: 'Naturally earthy with a heavy, syrupy mouthfeel.',
            whyItWorks: 'Matches the rich, soil-driven notes of Habano wrappers perfectly.',
            sommelierTip: 'Use a French Press to keep the coffee oils intact for maximum richness.',
            icon: 'Coffee',
            synergyScore: 0,
            profileMatch: { earth: 9, body: 7 },
            profile: { spice: 3, sweet: 3, earth: 9, cream: 3, wood: 4, body: 7 }
        },
        {
            category: 'rum',
            title: 'Aged Caribbean Dark Rum',
            subtitle: 'Caramel & Spice',
            description: 'Rich molasses sweetness with a long oak finish.',
            whyItWorks: 'Provides a sweet bridge that softens the peppery spice of a full-bodied cigar.',
            sommelierTip: 'Sip neat at 20°C to allow the oils to integrate with the smoke.',
            icon: 'GlassWater',
            synergyScore: 0,
            profileMatch: { sweet: 9, wood: 6 },
            profile: { spice: 5, sweet: 9, earth: 2, cream: 3, wood: 6, body: 8 }
        },
        {
            category: 'chocolate',
            title: '85% Single Origin Cacao',
            subtitle: 'Bitter & Pure',
            description: 'Dark, savory, and complex without excess sugar.',
            whyItWorks: 'The pure bitterness highlights the hidden floral notes in aged cigars.',
            sommelierTip: 'Melt a small square on your tongue before your first draw.',
            icon: 'Cookie',
            synergyScore: 0,
            profileMatch: { body: 8, earth: 7 },
            profile: { spice: 3, sweet: 2, earth: 8, cream: 1, wood: 4, body: 9 }
        }
    ];

    // Calculate Synergy
    return beverageProfiles.map(bev => {
        let diff = 0;
        diff += Math.abs(cigarProfile.body - bev.profile.body);
        diff += Math.abs(cigarProfile.earth - bev.profile.earth) * 0.5;
        diff += Math.abs(cigarProfile.spice - bev.profile.spice) * 0.5;

        // Higher score for closer matches (simple inverse)
        const synergyScore = Math.max(0, Math.min(100, 100 - (diff * 8)));
        return { ...bev, synergyScore };
    })
        .sort((a, b) => b.synergyScore - a.synergyScore)
        .slice(0, 4); // Top 4 matches
}

export function getReversePairing(category: PairingCategory, preference: string, occasion?: Occasion): ReversePairing {
    const p = preference.toLowerCase();
    const occ = occasion?.toLowerCase() || "";

    // Default fallback
    let result: ReversePairing = {
        title: 'Medium-Bodied Habano',
        idealProfile: 'A versatile cigar with notes of cedar, leather, and mild pepper.',
        whyItWorks: 'This balanced profile complements most beverages without stealing the show.',
        sommelierTip: 'Start with a Robusto size for a consistent 45-minute experience.',
        suggestedTags: ['Medium', 'Balanced', 'Habano'],
        profile: { spice: 4, sweet: 4, earth: 5, cream: 5, wood: 6, body: 6 }
    };

    // Visionary Logic: Overlays Occasion onto Preference
    if (occ === 'morning') {
        return {
            title: 'Clasico Dominican Lonsdale',
            idealProfile: 'Creamy, buttery, and light with notes of cedar and toasted nuts.',
            whyItWorks: 'Morning palates are fresh and sensitive. This mild start won\'t fatigue your taste buds.',
            sommelierTip: 'Pairs beautifully with a light roast coffee or a breakfast tea.',
            suggestedTags: ['Mild', 'Morning', 'Creamy'],
            profile: { spice: 2, sweet: 4, earth: 2, cream: 8, wood: 4, body: 3 }
        };
    }

    if (occ === 'celebration') {
        return {
            title: 'Aged Nicaraguan Figurado',
            idealProfile: 'Rare, complex, and transitioning from sweet cocoa to bold black pepper.',
            whyItWorks: 'Special moments demand a cigar that evolves. This shape offers a dynamic experience.',
            sommelierTip: 'Reserve this for the "top shelf" spirits in your collection.',
            suggestedTags: ['Premium', 'Celebration', 'Limited'],
            profile: { spice: 8, sweet: 3, earth: 6, cream: 2, wood: 7, body: 9 }
        };
    }

    if (category === 'wine') {
        if (p.includes('red') || p.includes('bold') || p.includes('cabernet')) {
            result = {
                title: 'Full-Bodied Nicaraguan',
                idealProfile: 'Powerful and spicy with earth and dark espresso notes.',
                whyItWorks: 'The structural tannins in bold reds need a high-nicotine, oily cigar to find equilibrium.',
                sommelierTip: 'Look for a "San Andres" or "Broadleaf" Maduro wrapper for a natural cocoa sweetness.',
                suggestedTags: ['Nicaraguan', 'Full', 'Maduro'],
                profile: { spice: 7, sweet: 3, earth: 8, cream: 1, wood: 5, body: 9 }
            };
        } else if (p.includes('white') || p.includes('light') || p.includes('pinot')) {
            result = {
                title: 'Mild Dominican Connecticut',
                idealProfile: 'Creamy, buttery, and smooth with notes of cashews and vanilla.',
                whyItWorks: 'Delicate white wines are easily overwhelmed. This mild profile lets the wine\'s acidity shine.',
                sommelierTip: 'Draw slowly. If the cigar gets too hot, it will turn bitter and clash with the wine.',
                suggestedTags: ['Mild', 'Connecticut', 'Creamy'],
                profile: { spice: 1, sweet: 5, earth: 2, cream: 9, wood: 3, body: 2 }
            };
        }
    } else if (category === 'whiskey') {
        if (p.includes('peat') || p.includes('smoke') || p.includes('islay')) {
            result = {
                title: 'Robust Sun-Grown Corojo',
                idealProfile: 'Red pepper spice, strong cedar, and a long, savory finish.',
                whyItWorks: 'Peated spirits need a partner that can "shout back". The Corojo spice cuts through the peat smoke.',
                sommelierTip: 'An aged Partagas or Rocky Patel Sun Grown is a classic Islay companion.',
                suggestedTags: ['Bold', 'Corojo', 'Spicy'],
                profile: { spice: 9, sweet: 2, earth: 6, cream: 1, wood: 8, body: 9 }
            };
        } else if (p.includes('bourbon') || p.includes('sweet')) {
            result = {
                title: 'Connecticut Broadleaf (Maduro)',
                idealProfile: 'Rich chocolate, molasses, and a heavy, syrupy smoke profile.',
                whyItWorks: 'Bourbon has natural corn sweetness and vanilla oak. This wrapper mirrors those sweet, dark notes.',
                sommelierTip: 'Try a Padron 1926 or My Father Le Bijou for the ultimate Bourbon pairing.',
                suggestedTags: ['Premium', 'Maduro', 'Sweet'],
                profile: { spice: 4, sweet: 9, earth: 5, cream: 3, wood: 4, body: 8 }
            };
        }
    } else if (category === 'coffee') {
        if (p.includes('espresso') || p.includes('dark')) {
            result = {
                title: 'Mexican San Andres Oscuro',
                idealProfile: 'Deep cocoa, roasted grain, and a thick, velvety smoke.',
                whyItWorks: 'Oscuro (black) wrappers are thick and oily, holding their own against concentrated espresso.',
                sommelierTip: 'The "Petit Corona" is a perfect size for an intense morning ritual.',
                suggestedTags: ['Very Bold', 'Dark', 'Mexican'],
                profile: { spice: 5, sweet: 6, earth: 9, cream: 1, wood: 4, body: 10 }
            };
        } else {
            result = {
                title: 'Clasico Dominican Lonsdale',
                idealProfile: 'Cedar, hay, and a very clean, nutty finish.',
                whyItWorks: 'Dominican tobacco is the smoothest on earth, blending seamlessly with the dairy in coffee.',
                sommelierTip: 'Look for a wrapper with a golden-yellow hue; this indicates a light, creamy smoke.',
                suggestedTags: ['Dominican', 'Mild', 'Nutty'],
                profile: { spice: 1, sweet: 4, earth: 2, cream: 10, wood: 3, body: 2 }
            };
        }
    } else if (category === 'rum') {
        if (p.includes('dark') || p.includes('aged')) {
            result = {
                title: 'Costa Rican Maduro',
                idealProfile: 'Rich, sweet, and heavy with notes of molasses and toasted oak.',
                whyItWorks: 'Aged rums are effectively liquid molasses. A Costa Rican Maduro provides the required weight and sugar.',
                sommelierTip: 'Try a Rocky Patel Fifty-Five for a decadent experience.',
                suggestedTags: ['Full', 'Maduro', 'Sweet'],
                profile: { spice: 3, sweet: 10, earth: 4, cream: 2, wood: 6, body: 9 }
            };
        } else {
            result = {
                title: 'Honduran Corojo',
                idealProfile: 'Medium-bodied with a classic "dirty" earthiness and spice.',
                whyItWorks: 'Spiced rums need a cigar with its own spice rack. The Corojo seed is the perfect match.',
                sommelierTip: 'The CLE Corojo is a fantastic choice for any spiced rum.',
                suggestedTags: ['Medium', 'Corojo', 'Spicy'],
                profile: { spice: 6, sweet: 4, earth: 7, cream: 1, wood: 5, body: 6 }
            };
        }
    } else if (category === 'chocolate') {
        result = {
            title: 'Nicaraguan Broadleaf',
            idealProfile: 'Dark chocolate, coffee bean, and a slightly salty finish.',
            whyItWorks: 'Dark chocolate needs a cigar that can match its intensity without being bitter.',
            sommelierTip: 'Eat a small piece of chocolate, then take a puff to see how the flavors meld.',
            suggestedTags: ['Full', 'Maduro', 'Complex'],
            profile: { spice: 5, sweet: 4, earth: 6, cream: 2, wood: 3, body: 9 }
        };
    } else if (category === 'tea') {
        result = {
            title: 'Mild Dominican Lonsdale',
            idealProfile: 'Floral, herbal, and light with a clean cedar finish.',
            whyItWorks: 'Tea is subtle. A heavy cigar would be like putting hot sauce on a salad. Balance is key.',
            sommelierTip: 'Green tea pairs excellently with a very light Connecticut shade wrapper.',
            suggestedTags: ['Mild', 'Floral', 'Dominican'],
            profile: { spice: 1, sweet: 3, earth: 2, cream: 7, wood: 5, body: 2 }
        };
    }

    return result;
}
