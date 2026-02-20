"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const HelpTabs = () => {
    const pathname = usePathname();

    const tabs = [
        { name: "Help", href: "/help" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex space-x-8">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    py-4 text-sm font-bold border-b-2 transition-colors
                                    ${isActive
                                        ? "border-black text-black"
                                        : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                                    }
                                `}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
