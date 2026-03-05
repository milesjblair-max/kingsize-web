"use client";

import { useEffect, useState } from "react";
import type { IRecommendationResponse, StyleBundle } from "@/services/PersonalizationService";
import type { IProduct } from "@kingsize/contracts";
import { getPrimaryImage } from "@/utils/image";

// ─── Product card (shared) ────────────────────────────────────────────────────

function ProductCard({ product }: { product: IProduct }) {
    const [imgError, setImgError] = useState(false);
    return (
        <div
            className="group cursor-pointer"
            style={{
                borderRadius: 10,
                overflow: "hidden",
                background: "#FAFAFA",
                border: "1px solid #F3F4F6",
                transition: "box-shadow 0.2s",
            }}
        >
            <div style={{ aspectRatio: "3/4", background: "#E5E7EB", position: "relative" }}>
                {product && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imgError ? "/images/placeholder.png" : getPrimaryImage(product)}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                )}
                {!product.inStock && (
                    <span style={{
                        position: "absolute", top: 8, right: 8,
                        background: "#111", color: "#fff", fontSize: 10,
                        fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                    }}>
                        Out of Stock
                    </span>
                )}
            </div>
            <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2 }}>{product.brand}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{product.name}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 4 }}>
                    A${product.price.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

// ─── Style Bundle ─────────────────────────────────────────────────────────────

function BundleRow({ bundle }: { bundle: StyleBundle }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{bundle.label}</h3>
                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
                    {bundle.tags.join(" · ")}
                </span>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
            }}>
                {bundle.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    );
}

// ─── Main StyleBundles component ──────────────────────────────────────────────

export function StyleBundles() {
    const [data, setData] = useState<IRecommendationResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/recommendations")
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                Curating your recommendations…
            </div>
        );
    }

    if (!data || data.shopByStyleBundles.length === 0) return null;

    return (
        <section aria-label="Style recommendations" style={{ padding: "48px 0" }}>
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 6 }}>
                    Style we recommend
                </h2>
                <p style={{ fontSize: 14, color: "#6B7280" }}>
                    Shop by style — curated for your fit
                </p>
            </div>

            {data.shopByStyleBundles.map((bundle) => (
                <BundleRow key={bundle.id} bundle={bundle} />
            ))}

            {data.heroPicks.length > 0 && (
                <div style={{ marginTop: 48 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#111" }}>
                        {data.meta.isAuthenticated ? "Picked for you" : "Trending now"}
                    </h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 12,
                    }}>
                        {data.heroPicks.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}
        </section>
    );
}
