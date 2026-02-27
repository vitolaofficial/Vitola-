const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

export interface RapidCigar {
    id: number;
    name: string;
    brandId: number;
    brandName?: string;
    length?: string;
    ringGauge?: string;
    strength?: string;
    wrapper?: string;
    origin?: string;
}

export async function searchCigars(query: string, page = 1) {
    if (!RAPIDAPI_KEY) return [];

    try {
        const url = new URL(`https://${RAPIDAPI_HOST}/cigars`);
        url.searchParams.append('name', query);
        url.searchParams.append('page', page.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
            },
        });

        if (!response.ok) throw new Error(`RapidAPI error: ${response.statusText}`);

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('RapidAPI search error:', error);
        return [];
    }
}

export async function getCigarDetails(id: number) {
    if (!RAPIDAPI_KEY) return null;

    try {
        const response = await fetch(`https://${RAPIDAPI_HOST}/cigars/${id}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
            },
        });

        if (!response.ok) throw new Error(`RapidAPI error: ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error('RapidAPI details error:', error);
        return null;
    }
}
