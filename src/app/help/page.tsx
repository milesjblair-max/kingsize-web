"use client";

import { useState, useEffect } from "react";
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
            {
                q: "How long does delivery take?",
                a: (
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Fulfillment typically takes up to 3 business days.</li>
                        <li>Regular Post: 5 to 10 business days from dispatch.</li>
                        <li>Express Post: 1 to 3 business days from dispatch.</li>
                        <li>Remote areas may require additional time.</li>
                    </ul>
                )
            },
            {
                q: "What are the shipping costs?",
                a: (
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Regular Post (Australia Post): $14.95</li>
                        <li>Express Post (StarTrack): $19.50</li>
                    </ul>
                )
            },
            {
                q: "Can I track my order?",
                a: "A tracking link will be emailed to you once your order is dispatched. Regular shipping can be tracked via the MyPost app. Note: New Zealand orders over 2kg cannot be tracked."
            },
            {
                q: "Do you deliver internationally?",
                a: "We ship to over 170 countries. We deliver to PO Boxes within Australia and selected international locations including Bahrain, Jordan, Kuwait, Qatar, Saudi Arabia, and UAE."
            },
            {
                q: "Can I change my delivery address?",
                a: "Please verify your address on your confirmation email immediately. We are unable to redirect orders once they have been dispatched."
            },
            {
                q: "Do I need to sign for delivery?",
                a: "You may select 'Authority to Leave' (ATL) to have the parcel left in a safe place. Couriers reserve the right to hold parcels if no safe place is available."
            },
            {
                q: "Can I add items to my order?",
                a: "Contact us immediately if you need to add items. If not yet dispatched, we may be able to add items, though this may delay fulfillment. Orders cannot be combined or modified once dispatched."
            },
            {
                q: "What happens after I place my order?",
                a: "You will receive an automated confirmation email, followed by updates during fulfillment and dispatch. If an item is unavailable, we will contact you to offer an alternative or a refund."
            },
        ]
    },
    {
        id: "returns",
        title: "Returns & Refunds",
        icon: RotateCcw,
        faqs: [
            {
                q: "How long do I have to return an item?",
                a: (
                    <div className="space-y-4">
                        <p>You have 28 days to return or exchange your item.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>In-store:</strong> 28 days from purchase</li>
                            <li><strong>Online:</strong> 28 days from delivery</li>
                        </ul>
                        <p className="font-bold pt-2">Items must:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Have original tags attached</li>
                            <li>Be unworn and only tried on for size</li>
                        </ul>
                    </div>
                )
            },
            {
                q: "Can I return an online order in store?",
                a: (
                    <div className="space-y-3">
                        <p className="font-bold">Yes.</p>
                        <p>Bring your tax invoice as proof of purchase. Refunds are processed back to your original payment method.</p>
                        <p className="text-gray-500 italic">Items that do not meet return conditions may be declined.</p>
                    </div>
                )
            },
            {
                q: "How do online returns work?",
                a: (
                    <div className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Complete the return form on the back of your tax invoice</li>
                            <li>Post your item back to us</li>
                            <li>Return postage is the customer’s responsibility</li>
                        </ul>
                        <p className="font-bold pt-2">Refunds:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Processed to original payment method</li>
                            <li>Original shipping costs are not refunded</li>
                            <li>Please allow up to 10 business days for funds to appear</li>
                        </ul>
                    </div>
                )
            },
            {
                q: "What if my item is incorrect or damaged?",
                a: "If we made an error or your item arrives damaged, we will cover the return cost. Contact us immediately and we will resolve it quickly. Note: We cannot accept responsibility for incorrect size or style selections."
            },
            {
                q: "Are overseas returns different?",
                a: "Yes. Customs duties and taxes paid on international orders are non-refundable."
            },
            {
                q: "Where are your retail stores?",
                a: (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="font-bold border-b mb-1">WA</p>
                            <p className="text-xs">Inglewood, Cannington, Joondalup</p>
                        </div>
                        <div>
                            <p className="font-bold border-b mb-1">QLD</p>
                            <p className="text-xs">Strathpine, Brisbane, Mount Gravatt, Chermside</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-bold border-b mb-1">VIC</p>
                            <p className="text-xs">Dandenong</p>
                        </div>
                    </div>
                )
            },
            {
                q: "What is the return address?",
                a: (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="font-bold text-gray-900">Kingsize Big & Tall</p>
                        <p>PO Box 44</p>
                        <p>Inglewood WA 6932</p>
                        <p className="mt-2 text-xs font-bold text-gray-400">1800 810 702 | 8am – 4pm AWST</p>
                    </div>
                )
            }
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

    // Reset expanded state when category changes
    useEffect(() => {
        setExpandedQuestion(null);
    }, [activeCategory]);

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

                            <div className="space-y-2">
                                {category?.faqs.map((faq, idx) => {
                                    const isOpen = expandedQuestion === idx;
                                    return (
                                        <div key={idx} className="border-b border-gray-100 last:border-0">
                                            <button
                                                onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                                                className="flex justify-between items-center w-full text-left py-4 group focus:outline-none"
                                            >
                                                <span className={`pr-4 text-base transition-colors ${isOpen ? 'text-black font-semibold' : 'text-gray-900 font-medium group-hover:text-black'}`}>
                                                    {faq.q}
                                                </span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`}
                                                />
                                            </button>

                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
