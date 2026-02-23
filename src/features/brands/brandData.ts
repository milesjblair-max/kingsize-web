// ─── Brand catalogue ──────────────────────────────────────────────────────────
// logoFile: filename inside /public/brand-logos/ — null means text-only fallback

export interface Brand {
    id: string;
    name: string;
    slug: string;
    /** Filename inside /public/brand-logos/, or null for text fallback */
    logoFile: string | null;
    /** Route when a user clicks the brand tile */
    href: string;
    /** Shown first in carousel and highlighted on /brands page */
    popular: boolean;
}

export const BRANDS: Brand[] = [
    // ── Popular (likely logos found) ──────────────────────────────────────────
    { id: "hugo-boss", name: "Hugo Boss", slug: "hugo-boss", logoFile: "hugo-boss.png", href: "/brands/hugo-boss", popular: true },
    { id: "nautica", name: "Nautica", slug: "nautica", logoFile: "nautica.png", href: "/brands/nautica", popular: true },
    { id: "ben-sherman", name: "Ben Sherman", slug: "ben-sherman", logoFile: "ben-sherman.png", href: "/brands/ben-sherman", popular: true },
    { id: "levis", name: "Levi's", slug: "levis", logoFile: "levis.png", href: "/brands/levis", popular: true },
    { id: "calvin-klein", name: "Calvin Klein", slug: "calvin-klein", logoFile: "calvin-klein.png", href: "/brands/calvin-klein", popular: true },
    { id: "jack-jones", name: "Jack & Jones", slug: "jack-jones", logoFile: "jack-jones.png", href: "/brands/jack-jones", popular: true },
    { id: "new-balance", name: "New Balance", slug: "new-balance", logoFile: "new-balance.png", href: "/brands/new-balance", popular: true },
    { id: "skechers", name: "Skechers", slug: "skechers", logoFile: "skechers.png", href: "/brands/skechers", popular: true },
    { id: "vans", name: "Vans", slug: "vans", logoFile: "vans.png", href: "/brands/vans", popular: true },
    { id: "dickies", name: "Dickies", slug: "dickies", logoFile: "dickies.png", href: "/brands/dickies", popular: true },
    { id: "jockey", name: "Jockey", slug: "jockey", logoFile: "jockey.png", href: "/brands/jockey", popular: true },
    { id: "keen", name: "Keen", slug: "keen", logoFile: "keen.png", href: "/brands/keen", popular: true },
    { id: "north-56", name: "North 56", slug: "north-56", logoFile: "north-56.png", href: "/brands/north-56", popular: true },
    { id: "raging-bull", name: "Raging Bull", slug: "raging-bull", logoFile: "raging-bull.png", href: "/brands/raging-bull", popular: true },
    { id: "doc-martens", name: "Doc Martens", slug: "doc-martens", logoFile: "doc-martens.png", href: "/brands/doc-martens", popular: true },

    // ── Additional (with attempted logos) ────────────────────────────────────
    { id: "daniel-hechter", name: "Daniel Hechter", slug: "daniel-hechter", logoFile: "daniel-hechter.png", href: "/brands/daniel-hechter", popular: false },
    { id: "rembrandt", name: "Rembrandt", slug: "rembrandt", logoFile: "rembrandt.png", href: "/brands/rembrandt", popular: false },
    { id: "mustang", name: "Mustang", slug: "mustang", logoFile: "mustang.png", href: "/brands/mustang", popular: false },
    { id: "olukai", name: "Olukai", slug: "olukai", logoFile: "olukai.png", href: "/brands/olukai", popular: false },
    { id: "rossi", name: "Rossi", slug: "rossi", logoFile: "rossi.png", href: "/brands/rossi", popular: false },

    // ── Text-only brands (logos not publicly available) ──────────────────────
    { id: "gaz-man", name: "Gaz Man", slug: "gaz-man", logoFile: null, href: "/brands/gaz-man", popular: false },
    { id: "casa-moda", name: "Casa Moda", slug: "casa-moda", logoFile: null, href: "/brands/casa-moda", popular: false },
    { id: "ansett", name: "Ansett", slug: "ansett", logoFile: null, href: "/brands/ansett", popular: false },
    { id: "backbay", name: "Backbay", slug: "backbay", logoFile: null, href: "/brands/backbay", popular: false },
    { id: "breakaway", name: "Breakaway", slug: "breakaway", logoFile: null, href: "/brands/breakaway", popular: false },
    { id: "bronco", name: "Bronco", slug: "bronco", logoFile: null, href: "/brands/bronco", popular: false },
    { id: "brooksfield", name: "Brooksfield", slug: "brooksfield", logoFile: null, href: "/brands/brooksfield", popular: false },
    { id: "boston", name: "Boston", slug: "boston", logoFile: null, href: "/brands/boston", popular: false },
    { id: "buckle", name: "Buckle", slug: "buckle", logoFile: null, href: "/brands/buckle", popular: false },
    { id: "cipollini", name: "Cipollini", slug: "cipollini", logoFile: null, href: "/brands/cipollini", popular: false },
    { id: "city-club", name: "City Club", slug: "city-club", logoFile: null, href: "/brands/city-club", popular: false },
    { id: "coast", name: "Coast", slug: "coast", logoFile: null, href: "/brands/coast", popular: false },
    { id: "dario-beltran", name: "Dario Beltran", slug: "dario-beltran", logoFile: null, href: "/brands/dario-beltran", popular: false },
    { id: "dawgs", name: "Dawgs", slug: "dawgs", logoFile: null, href: "/brands/dawgs", popular: false },
    { id: "duke", name: "Duke", slug: "duke", logoFile: null, href: "/brands/duke", popular: false },
    { id: "espionage", name: "Espionage", slug: "espionage", logoFile: null, href: "/brands/espionage", popular: false },
    { id: "gloweave", name: "Gloweave", slug: "gloweave", logoFile: null, href: "/brands/gloweave", popular: false },
    { id: "high-country", name: "High Country", slug: "high-country", logoFile: null, href: "/brands/high-country", popular: false },
    { id: "hunt-holditch", name: "Hunt & Holditch", slug: "hunt-holditch", logoFile: null, href: "/brands/hunt-holditch", popular: false },
    { id: "jimmy-stuart", name: "Jimmy Stuart", slug: "jimmy-stuart", logoFile: null, href: "/brands/jimmy-stuart", popular: false },
    { id: "kam", name: "Kam", slug: "kam", logoFile: null, href: "/brands/kam", popular: false },
    { id: "koala", name: "Koala", slug: "koala", logoFile: null, href: "/brands/koala", popular: false },
    { id: "oliver", name: "Oliver", slug: "oliver", logoFile: null, href: "/brands/oliver", popular: false },
    { id: "perrone", name: "Perrone", slug: "perrone", logoFile: null, href: "/brands/perrone", popular: false },
    { id: "pilbara", name: "Pilbara", slug: "pilbara", logoFile: null, href: "/brands/pilbara", popular: false },
    { id: "red-point", name: "Red Point", slug: "red-point", logoFile: null, href: "/brands/red-point", popular: false },
    { id: "slatters", name: "Slatters", slug: "slatters", logoFile: null, href: "/brands/slatters", popular: false },
    { id: "trade-winds", name: "Trade Winds", slug: "trade-winds", logoFile: null, href: "/brands/trade-winds", popular: false },
    { id: "tradies", name: "Tradies", slug: "tradies", logoFile: null, href: "/brands/tradies", popular: false },
    { id: "workland", name: "Workland", slug: "workland", logoFile: null, href: "/brands/workland", popular: false },
    { id: "the-tie-company", name: "The Tie Company", slug: "the-tie-company", logoFile: null, href: "/brands/the-tie-company", popular: false },
    { id: "prime", name: "Prime", slug: "prime", logoFile: null, href: "/brands/prime", popular: false },
    { id: "aussie", name: "Aussie", slug: "aussie", logoFile: null, href: "/brands/aussie", popular: false },
    { id: "bob-spears", name: "Bob Spears", slug: "bob-spears", logoFile: null, href: "/brands/bob-spears", popular: false },
    { id: "cambridge", name: "Cambridge", slug: "cambridge", logoFile: null, href: "/brands/cambridge", popular: false },
    { id: "replika", name: "Replika", slug: "replika", logoFile: null, href: "/brands/replika", popular: false },
    { id: "maurio", name: "Maurio", slug: "maurio", logoFile: null, href: "/brands/maurio", popular: false },
    { id: "bamboo", name: "Bamboo", slug: "bamboo", logoFile: null, href: "/brands/bamboo", popular: false },
    { id: "adventure-line", name: "Adventure Line", slug: "adventure-line", logoFile: null, href: "/brands/adventure-line", popular: false },
    { id: "atlas", name: "Atlas", slug: "atlas", logoFile: null, href: "/brands/atlas", popular: false },
    { id: "freeworld", name: "Freeworld", slug: "freeworld", logoFile: null, href: "/brands/freeworld", popular: false },
    { id: "blue-horizon", name: "Blue Horizon", slug: "blue-horizon", logoFile: null, href: "/brands/blue-horizon", popular: false },
    { id: "bamboozld", name: "BambooZLD", slug: "bamboozld", logoFile: null, href: "/brands/bamboozld", popular: false },
    { id: "ferracini", name: "Ferracini", slug: "ferracini", logoFile: null, href: "/brands/ferracini", popular: false },
];

export const POPULAR_BRANDS = BRANDS.filter((b) => b.popular);

/** Group brands by their first letter */
export function groupByLetter(brands: Brand[]): Record<string, Brand[]> {
    return brands.reduce<Record<string, Brand[]>>((acc, brand) => {
        const letter = brand.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(brand);
        return acc;
    }, {});
}
