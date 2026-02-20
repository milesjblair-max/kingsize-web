"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shirt,
    Layers,
    Scissors,
    Briefcase,
    Dumbbell,
    Footprints,
    Tag,
    Star,
    Flame,
    ShoppingBag,
    Zap,
    Package,
    Wind,
    Target,
    Activity,
    PersonStanding,
} from "lucide-react";

// --- Types ---
interface SubItem {
    label: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
}

interface DropdownColumn {
    heading: string;
    items: SubItem[];
}

interface Category {
    name: string;
    href: string;
    columns: DropdownColumn[];
}

// --- Category data ---
const categories: Category[] = [
    {
        name: "New In",
        href: "/new-in",
        columns: [
            {
                heading: "Just Arrived",
                items: [
                    { label: "New This Week", href: "#", icon: Zap },
                    { label: "Back in Stock", href: "#", icon: Star },
                    { label: "Trending Now", href: "#", icon: Flame },
                ],
            },
            {
                heading: "By Category",
                items: [
                    { label: "New Tops", href: "#", icon: Shirt },
                    { label: "New Bottoms", href: "#", icon: Scissors },
                    { label: "New Footwear", href: "#", icon: Footprints },
                    { label: "New Essentials", href: "#", icon: Package },
                ],
            },
            {
                heading: "Shop By",
                items: [
                    { label: "Big & Tall", href: "#" },
                    { label: "Extended Sizes", href: "#" },
                    { label: "Clearance", href: "#" },
                ],
            },
        ],
    },
    {
        name: "Casual Wear",
        href: "/casual",
        columns: [
            {
                heading: "New Season",
                items: [
                    { label: "New In Casual", href: "#", icon: Zap },
                    { label: "Best Sellers", href: "#", icon: Star },
                    { label: "Clearance", href: "#", icon: Tag },
                ],
            },
            {
                heading: "Categories",
                items: [
                    { label: "T-Shirts & Polos", href: "#", icon: Shirt },
                    { label: "Casual Shirts", href: "#", icon: Shirt },
                    { label: "Shorts", href: "#", icon: Scissors },
                    { label: "Jeans", href: "#", icon: Layers },
                    { label: "Chinos & Pants", href: "#", icon: Layers },
                ],
            },
            {
                heading: "Shop By",
                items: [
                    { label: "Big Fit", href: "#" },
                    { label: "Tall Fit", href: "#" },
                    { label: "Workwear Basics", href: "#" },
                ],
            },
        ],
    },
    {
        name: "Smart & Formal",
        href: "/smart",
        columns: [
            {
                heading: "New Season",
                items: [
                    { label: "New In Formal", href: "#", icon: Zap },
                    { label: "Best Sellers", href: "#", icon: Star },
                    { label: "Clearance", href: "#", icon: Tag },
                ],
            },
            {
                heading: "Categories",
                items: [
                    { label: "Business Shirts", href: "#", icon: Briefcase },
                    { label: "Dress Pants", href: "#", icon: Layers },
                    { label: "Blazers", href: "#", icon: Shirt },
                    { label: "Suits", href: "#", icon: Briefcase },
                    { label: "Ties & Accessories", href: "#", icon: Tag },
                ],
            },
            {
                heading: "Shop By",
                items: [
                    { label: "Big Fit", href: "#" },
                    { label: "Tall Fit", href: "#" },
                    { label: "Occasion Wear", href: "#" },
                ],
            },
        ],
    },
    {
        name: "Active & Sport",
        href: "/active",
        columns: [
            {
                heading: "Categories",
                items: [
                    { label: "Tops", href: "#", icon: Shirt },
                    { label: "Bottoms", href: "#", icon: Layers },
                    { label: "Jackets", href: "#", icon: Wind },
                    { label: "Shoes", href: "#", icon: Footprints },
                    { label: "Accessories", href: "#", icon: Tag },
                ],
            },
            {
                heading: "Sport Types",
                items: [
                    { label: "Running", href: "#", icon: Activity },
                    { label: "Gym", href: "#", icon: Dumbbell },
                    { label: "Outdoor", href: "#", icon: Target },
                    { label: "Training", href: "#", icon: PersonStanding },
                ],
            },
            {
                heading: "Brands",
                items: [
                    { label: "Nike", href: "#" },
                    { label: "Adidas", href: "#" },
                    { label: "New Balance", href: "#" },
                    { label: "Asics", href: "#" },
                    { label: "Under Armour", href: "#" },
                ],
            },
        ],
    },
    {
        name: "Footwear",
        href: "/footwear",
        columns: [
            {
                heading: "New Season",
                items: [
                    { label: "New In Footwear", href: "#", icon: Zap },
                    { label: "Best Sellers", href: "#", icon: Star },
                ],
            },
            {
                heading: "Categories",
                items: [
                    { label: "Casual Shoes", href: "#", icon: Footprints },
                    { label: "Dress Shoes", href: "#", icon: Footprints },
                    { label: "Boots", href: "#", icon: Footprints },
                    { label: "Sandals & Thongs", href: "#", icon: Footprints },
                ],
            },
            {
                heading: "Brands",
                items: [
                    { label: "Bata", href: "#" },
                    { label: "Dunlop", href: "#" },
                    { label: "Mossimo", href: "#" },
                ],
            },
        ],
    },
    {
        name: "Essentials",
        href: "/essentials",
        columns: [
            {
                heading: "New Season",
                items: [
                    { label: "New In", href: "#", icon: Zap },
                    { label: "Best Sellers", href: "#", icon: Star },
                ],
            },
            {
                heading: "Categories",
                items: [
                    { label: "Underwear", href: "#", icon: ShoppingBag },
                    { label: "Socks", href: "#", icon: Package },
                    { label: "Belts", href: "#", icon: Tag },
                    { label: "Sleepwear", href: "#", icon: Layers },
                    { label: "Swimwear", href: "#", icon: Wind },
                ],
            },
            {
                heading: "Shop By",
                items: [
                    { label: "Big Fit", href: "#" },
                    { label: "Tall Fit", href: "#" },
                ],
            },
        ],
    },
];

export const CategoryBar = () => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const activeCategory = categories.find((c) => c.name === hoveredCategory);

    return (
        // The outer wrapper is `relative` so the dropdown anchors to it, spanning full width
        <div
            className="border-b border-gray-200 bg-white z-40 relative"
            style={{ height: "44px" }}
            onMouseLeave={() => setHoveredCategory(null)}
        >
            {/* Category tab row — scrollable on small screens */}
            <div
                className="w-full px-4 md:px-6 h-full flex items-center"
                style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <ul className="flex h-full" style={{ gap: "clamp(16px, 3vw, 32px)", whiteSpace: "nowrap" }}>
                    {categories.map((category) => (
                        <li
                            key={category.name}
                            className="h-full flex items-center cursor-pointer"
                            onMouseEnter={() => setHoveredCategory(category.name)}
                        >
                            <Link
                                href={category.href}
                                className={`text-sm font-bold uppercase tracking-wide transition-colors pb-1 ${hoveredCategory === category.name
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-900 border-b-2 border-transparent"
                                    }`}
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Full-width dropdown panel */}
            {activeCategory && (
                <div
                    className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-xl z-50"
                    onMouseEnter={() => setHoveredCategory(activeCategory.name)}
                >
                    <div className="max-w-7xl mx-auto px-8 py-8">
                        <div className="grid grid-cols-3 gap-12">
                            {activeCategory.columns.map((col) => (
                                <div key={col.heading}>
                                    {/* Column heading — Zalando style: muted gray, small caps */}
                                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                        {col.heading}
                                    </h4>
                                    <ul className="space-y-3">
                                        {col.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.label}>
                                                    <a
                                                        href={item.href}
                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600 group transition-colors"
                                                    >
                                                        {Icon && (
                                                            <Icon
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                className="text-gray-400 group-hover:text-orange-500 flex-shrink-0 transition-colors"
                                                            />
                                                        )}
                                                        <span className="group-hover:underline underline-offset-2">
                                                            {item.label}
                                                        </span>
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* "Shop all" at bottom of first column */}
                                    {col === activeCategory.columns[0] && (
                                        <Link
                                            href={activeCategory.href}
                                            className="mt-5 inline-block text-xs font-bold text-gray-900 underline underline-offset-2 hover:text-orange-600"
                                        >
                                            Shop all {activeCategory.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
