import type { SwipeCard } from "@/features/auth/AuthContext";

// Swipe cards using real images from the repo
// Each image has: label, category, and tags for LLM analysis
export const SWIPE_CARDS: SwipeCard[] = [
    {
        id: "nautica-polo",
        image: "/images/new-arrivals/nautica-polo.jpg",
        label: "Nautica Polo",
        category: "tops",
        tags: ["smart casual", "polo", "summer", "neutral"],
    },
    {
        id: "nautica-polo2",
        image: "/images/new-arrivals/nautica-polo2.jpg",
        label: "Nautica Polo (Blue)",
        category: "tops",
        tags: ["smart casual", "polo", "classic", "blue"],
    },
    {
        id: "gm-polo",
        image: "/images/new-arrivals/gm-polo.jpg",
        label: "GM Polo",
        category: "tops",
        tags: ["casual", "polo", "everyday", "neutral"],
    },
    {
        id: "gm-polo2",
        image: "/images/new-arrivals/gm-polo2.jpg",
        label: "GM Polo (Stripe)",
        category: "tops",
        tags: ["casual", "stripe", "weekend", "summer"],
    },
    {
        id: "tw-polo",
        image: "/images/new-arrivals/tw-polo.jpg",
        label: "TW Polo",
        category: "tops",
        tags: ["smart casual", "polo", "versatile", "neutral"],
    },
    {
        id: "tw-polo-aqua",
        image: "/images/new-arrivals/tw-polo-aqua.jpg",
        label: "TW Polo (Aqua)",
        category: "tops",
        tags: ["casual", "polo", "summer", "fresh"],
    },
    {
        id: "hk-tshirt",
        image: "/images/new-arrivals/hk-tshirt.jpg",
        label: "HK Basic Tee",
        category: "tops",
        tags: ["casual", "basics", "everyday", "neutral"],
    },
    {
        id: "nau-tshirt",
        image: "/images/new-arrivals/nau-tshirt.jpg",
        label: "Nautica T-Shirt",
        category: "tops",
        tags: ["casual", "branded", "summer", "relaxed"],
    },
    {
        id: "jack-jones-tshirt",
        image: "/images/new-arrivals/jack-jones-tshirt.jpg",
        label: "Jack Jones Tee",
        category: "tops",
        tags: ["casual", "streetwear", "graphic", "youth"],
    },
    {
        id: "jj-tshirt-blk",
        image: "/images/new-arrivals/jj-tshirt-blk.jpg",
        label: "Jack Jones Tee (Black)",
        category: "tops",
        tags: ["casual", "dark", "versatile", "streetwear"],
    },
    {
        id: "cm-tshirt",
        image: "/images/new-arrivals/cm-tshirt.jpg",
        label: "Classic Tee",
        category: "tops",
        tags: ["basics", "casual", "everyday", "plain"],
    },
    {
        id: "gm-shorts-blue",
        image: "/images/new-arrivals/gm-shorts-blue.jpg",
        label: "GM Shorts (Blue)",
        category: "shorts",
        tags: ["casual", "shorts", "summer", "blue"],
    },
    {
        id: "gm-shorts-tan",
        image: "/images/new-arrivals/gm-shorts-tan.jpg",
        label: "GM Shorts (Tan)",
        category: "shorts",
        tags: ["casual", "shorts", "neutral", "warm"],
    },
    {
        id: "kam-shorts",
        image: "/images/new-arrivals/kam-shorts.jpg",
        label: "KAM Cargo Short",
        category: "shorts",
        tags: ["casual", "cargo", "utility", "rugged"],
    },
    {
        id: "kam-shorts-blue",
        image: "/images/new-arrivals/kam-shorts-blue.jpg",
        label: "KAM Shorts (Blue)",
        category: "shorts",
        tags: ["casual", "shorts", "smart casual", "blue"],
    },
    {
        id: "nau-shorts",
        image: "/images/new-arrivals/nau-shorts.jpg",
        label: "Nautica Shorts",
        category: "shorts",
        tags: ["smart casual", "shorts", "branded", "summer"],
    },
];

// Shuffle and pick N cards
export const getRandomCards = (n = 10): SwipeCard[] => {
    const shuffled = [...SWIPE_CARDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
};
