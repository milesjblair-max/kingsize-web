interface ProductImageShape {
    imageUrl?: string;
    primaryImageUrl?: string;
    images?: { isPrimary?: boolean; url?: string; position?: number }[];
    image?: string;
}

export function getPrimaryImage(product: ProductImageShape): string {
    // Hard fallback: a tiny, light-gray SVG data URI that will NEVER be broken
    const DEFAULT_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3EProduct Image%3C/text%3E%3C/svg%3E";

    // Check if it's the IProduct shape (API gateway returned)
    if (product?.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim() !== "" && !product.imageUrl.includes("placeholder.png")) {
        return product.imageUrl;
    }

    // Check if it's the ICatalogProduct shape (direct catalog return)
    if (product?.primaryImageUrl && typeof product.primaryImageUrl === "string" && product.primaryImageUrl.trim() !== "" && !product.primaryImageUrl.includes("placeholder.png")) {
        return product.primaryImageUrl;
    }

    // Check ICatalogProduct images array
    if (Array.isArray(product?.images) && product.images.length > 0) {
        // Try to find marked primary
        const primary = product.images.find((img) => img.isPrimary);
        if (primary?.url && "string" === typeof primary.url && !primary.url.includes("placeholder.png")) return primary.url;
        // Try to find position 1
        const pos1 = product.images.find((img) => img.position === 1);
        if (pos1?.url && "string" === typeof pos1.url && !pos1.url.includes("placeholder.png")) return pos1.url;
        // Fallback to the first image
        const first = product.images[0];
        if (first?.url && "string" === typeof first.url && !first.url.includes("placeholder.png")) return first.url;
    }

    if (product?.image && typeof product.image === "string" && product.image.trim() !== "" && !product.image.includes("placeholder.png")) {
        return product.image; // e.g. from static Recommendation / Swipe objects
    }

    return DEFAULT_FALLBACK;
}
