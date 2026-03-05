export function getPrimaryImage(product: any): string {
    // Check if it's the IProduct shape (API gateway returned)
    if (product?.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim() !== "") {
        return product.imageUrl;
    }

    // Check if it's the ICatalogProduct shape (direct catalog return)
    if (product?.primaryImageUrl && typeof product.primaryImageUrl === "string" && product.primaryImageUrl.trim() !== "") {
        return product.primaryImageUrl;
    }

    // Check ICatalogProduct images array
    if (Array.isArray(product?.images) && product.images.length > 0) {
        // Try to find marked primary
        const primary = product.images.find((img: any) => img.isPrimary);
        if (primary?.url && "string" === typeof primary.url) return primary.url;
        // Try to find position 1
        const pos1 = product.images.find((img: any) => img.position === 1);
        if (pos1?.url && "string" === typeof pos1.url) return pos1.url;
        // Fallback to the first image
        const first = product.images[0];
        if (first?.url && "string" === typeof first.url) return first.url;
    }

    if (product?.image && typeof product.image === "string" && product.image.trim() !== "") {
        return product.image; // e.g. from static Recommendation / Swipe objects
    }

    // Hard fallback
    return "/images/placeholder.png";
}
