"use client";

import { useState } from "react";
import { HelpTabs } from "@/features/help/HelpTabs";
import {
    User, Package, Truck,
    RotateCcw, CreditCard, Ruler,
    Gift, ShieldCheck, MapPin,
    MessageSquare, ChevronRight, ChevronDown, ChevronUp, ArrowRight
} from "lucide-react";
import Link from "next/link";

// 1. Help Categories Data
const HELP_CATEGORIES = [
    {
        id: "account",
        title: "My Account",
        icon: User,
        faqs: [
            { q: "How do I create an account?", a: "Click on 'Sign In' at the top right and select 'Create Account'. Fill in your details and you're set." },
            { q: "I forgot my password.", a: "Go to the login page and click 'Forgot your password?'. Enter your email to receive a reset link." },
            { q: "How do I update my details?", a: "Log in to your account and go to 'My Details' to update your address or contact info." },
        ]
    },
    {
        id: "orders",
        title: "Orders",
        icon: Package,
        faqs: [
            { q: "Where is my order?", a: "You can track your order status in 'My Account' under 'Order History'." },
            { q: "Can I cancel my order?", a: "Orders can only be cancelled within 30 minutes of placement. Please contact support immediately." },
            { q: "I received a wrong item.", a: "We apologize! Please contact our support team with your order number and photos of the item." },
        ]
    },
    {
        id: "delivery",
        title: "Delivery",
        icon: Truck,
        faqs: [
            { q: "How much is shipping?", a: "Standard shipping is $10. Express shipping is $15. Free shipping on orders over $150." },
            { q: "Do you ship internationally?", a: "Yes, we ship to New Zealand and selected international locations." },
            { q: "How long does delivery take?", a: "Standard delivery takes 3-7 business days. Express is 1-3 business days." },
        ]
    },
    {
        id: "returns",
        title: "Returns & Refunds",
        icon: RotateCcw,
        faqs: [
            { q: "What is your return policy?", a: "You can return items within 30 days of purchase if they are unworn and have tags attached." },
            { q: "How do I return an item?", a: "Visit our Returns portal to generate a return label." },
            { q: "When will I get my refund?", a: "Refunds are processed within 5-7 business days after we receive your return." },
        ]
    },
    {
        id: "payments",
        title: "Payments",
        icon: CreditCard,
        faqs: [
            { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, Amex, PayPal, and Afterpay." },
            { q: "Is it safe to pay online?", a: "Yes, all transactions are encrypted and secure." },
        ]
    },
    {
        id: "sizing",
        title: "Sizing & Fit",
        icon: Ruler,
        faqs: [
            { q: "Where can I find a size guide?", a: "Each product page has a detailed size guide link near the size selector." },
            { q: "Do your sizes run true to size?", a: "Yes, our sizes are tailored for big and tall fits specifically." },
        ]
    },
    {
        id: "giftcards",
        title: "Gift Cards",
        icon: Gift,
        faqs: [
            { q: "Do you sell gift cards?", a: "Yes, digital gift cards are available for purchase online." },
            { q: "How do I use my gift card?", a: "Enter the gift card code at checkout in the payment section." },
        ]
    },
    {
        id: "productcare",
        title: "Product Care & Safety",
        icon: ShieldCheck,
        faqs: [
            { q: "How do I wash my items?", a: "Please follow the care instructions on the label inside each garment." },
        ]
    },
    {
        id: "stores",
        title: "Store Shopping",
        icon: MapPin,
        faqs: [
            { q: "Where are your stores located?", a: "We have stores across Australia. Check the Contact page for locations." },
            { q: "Can I click and collect?", a: "Yes, select 'Click & Collect' at checkout to pick up from your nearest store." },
        ]
    },
    {
        id: "contact",
        title: "Contact Support",
        icon: MessageSquare,
        faqs: [
            { q: "How can I contact you?", a: "You can call us or visit a store. See our Contact page for details." },
            { q: "What are your support hours?", a: "Support is available Mon-Fri 9am-5pm AEST." },
        ]
    },
];

export default function HelpPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    const category = HELP_CATEGORIES.find(c => c.id === activeCategory);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Area */}
            <div className="bg-white pt-12 pb-0 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello, how can we help you?</h1>
                    <p className="text-lg text-gray-600">Select a topic below.</p>
                </div>
                <HelpTabs />
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8">

                {/* Login Prompt Row - Only show on main grid view */}
                {!activeCategory && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Got a specific question?</h3>
                            <p className="text-gray-600 text-sm">We can help you better if we know who you are.</p>
                        </div>
                        <Link href="/login" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors whitespace-nowrap">
                            Log in <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* Main Content Area */}
                {!activeCategory ? (
                    /* Category Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Returns Policy — first tile, routes to dedicated page */}
                        <Link
                            href="/help/returns-policy"
                            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-all text-left flex flex-col h-full group"
                        >
                            <div className="mb-4 text-gray-900 group-hover:text-black">
                                <RotateCcw size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-black">Returns Policy</h3>
                            <div className="mt-auto flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={20} className="text-gray-400" />
                            </div>
                        </Link>

                        {/* All other categories */}
                        {HELP_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-all text-left flex flex-col h-full group"
                            >
                                <div className="mb-4 text-gray-900 group-hover:text-black">
                                    <cat.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-black">{cat.title}</h3>
                                <div className="mt-auto flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className="text-gray-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Detail View (Questions) */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1"
                            >
                                <ChevronRight className="rotate-180" size={16} /> Back to topics
                            </button>
                        </div>

                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                {category?.icon && <category.icon size={28} />}
                                {category?.title}
                            </h2>

                            <div className="space-y-4">
                                {category?.faqs.map((faq, idx) => (
                                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <button
                                            onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                            className="flex justify-between items-center w-full text-left font-bold text-gray-900 hover:text-black py-2"
                                        >
                                            <span className="pr-4">{faq.q}</span>
                                            {expandedQuestion === idx ? <ChevronUp size={20} className="flex-shrink-0" /> : <ChevronDown size={20} className="flex-shrink-0" />}
                                        </button>

                                        {expandedQuestion === idx && (
                                            <div className="mt-2 text-gray-600 text-sm leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
