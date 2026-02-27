export interface CigarEntry {
    id: string;
    name: string;
    brand: string;
    origin: string;
    wrapper: string;
    strength: "Mild" | "Medium" | "Full" | "Full+";
    size: string;
    quantity: number;
    rating: number;
    notes: string;
    addedDate: string;
    addedTimestamp: number;
}

export interface CatalogCigar {
    id: string;
    name: string;
    brand: string;
    origin: string;
    wrapper: string;
    strength: string;
    size: string;
    rating: number;
    price: string;
    notes: string;
    description: string;
    tags: string[];
    pairings: string[];
    image_url?: string;
    image?: string;
    isUserCigar?: boolean;
}
