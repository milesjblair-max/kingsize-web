import Link from "next/link";
import { RotateCcw, ArrowLeft, Store, Phone } from "lucide-react";

export const metadata = {
    title: "Returns Policy | Kingsize Big & Tall",
    description: "Our full returns and exchanges policy for in-store and online purchases.",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
);

// ─── Info box ─────────────────────────────────────────────────────────────────
const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 text-sm text-amber-900 leading-relaxed">
        {children}
    </div>
);

// ─── Bullet list ──────────────────────────────────────────────────────────────
const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-1.5">
        {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">·</span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

// ─── Store list ───────────────────────────────────────────────────────────────
const STORES = [
    { state: "WA", locations: "Inglewood · Cannington · Joondalup" },
    { state: "QLD", locations: "Strathpine · Brisbane · Mount Gravatt · Chermside" },
    { state: "VIC", locations: "Dandenong" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReturnsPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">

            {/* Header — matches Help page style */}
            <div className="bg-white pt-12 pb-8 shadow-sm border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4">
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium"
                    >
                        <ArrowLeft size={15} strokeWidth={2} />
                        Back to Help
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <RotateCcw size={20} strokeWidth={1.6} className="text-gray-700" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Returns Policy</h1>
                    </div>
                    <p className="text-gray-500 text-base ml-[52px]">
                        Shop with confidence. If something isn&apos;t right, we&apos;re here to help.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 mt-10">

                {/* Important notice */}
                <InfoBox>
                    <strong>Please note:</strong> Underwear is non-returnable.
                </InfoBox>

                <div className="mt-8">

                    {/* In-store */}
                    <Section title="In-Store Returns and Exchanges">
                        <p>You have <strong>28 days from the date of purchase</strong> to return or exchange an item in store.</p>

                        <p className="font-semibold text-gray-800">Items must:</p>
                        <BulletList items={[
                            "Have original tags attached",
                            "Be unworn and only tried on for size",
                        ]} />

                        <p>Online orders can be returned or exchanged in store.</p>
                        <p>Refunds are processed back to your original payment method.</p>
                        <p>Please bring your <strong>Tax Invoice</strong> as proof of purchase.</p>

                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-5 py-3 text-sm text-gray-500">
                            Items that do not meet return conditions may be declined at the time of return.
                        </div>
                    </Section>

                    {/* Online */}
                    <Section title="Online Returns and Exchanges">
                        <p>You have <strong>28 days from the date of delivery</strong> to return or exchange an item.</p>

                        <p className="font-semibold text-gray-800">Items must:</p>
                        <BulletList items={[
                            "Have original tags attached",
                            "Be unworn and only tried on for size",
                        ]} />

                        <p>We do not provide return labels. Return postage costs are the responsibility of the customer.</p>

                        <div>
                            <p className="font-semibold text-gray-800 mb-1.5">Refunds:</p>
                            <BulletList items={[
                                "Processed to your original payment method",
                                "Exclude original shipping costs",
                                "May take up to 10 business days to appear",
                            ]} />
                        </div>

                        <p>For exchanges, additional postage costs may apply. Our team will contact you once your return has been received.</p>

                        {/* Return address */}
                        <div
                            className="rounded-xl border border-gray-100 bg-white p-5 mt-2"
                            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Return address</p>
                            <p className="font-bold text-gray-900 leading-relaxed">
                                Kingsize Big &amp; Tall<br />
                                PO BOX 44<br />
                                Inglewood WA 6932
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-gray-600">
                                <Phone size={13} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
                                <span>1800 810 702</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400 text-xs">8am – 4pm AWST</span>
                            </div>
                        </div>
                    </Section>

                    {/* Incorrect / damaged */}
                    <Section title="Incorrect or Damaged Items">
                        <p>
                            If we have made an error, or your item arrives damaged, we will cover the cost of the return.
                            Please contact us immediately by phone or email so we can resolve it quickly.
                        </p>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-5 py-3 text-sm text-gray-500">
                            We are not responsible for incorrect size or style selections. Detailed sizing information is provided on each product page to help guide your choice.
                        </div>
                    </Section>

                    {/* Overseas */}
                    <Section title="Overseas Returns">
                        <p>Customs duties and taxes paid on international orders are non-refundable.</p>
                    </Section>

                    {/* Stores */}
                    <Section title="Our Retail Stores">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {STORES.map((s) => (
                                <div
                                    key={s.state}
                                    className="rounded-xl bg-white border border-gray-100 p-4"
                                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Store size={14} strokeWidth={1.8} className="text-gray-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{s.state}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{s.locations}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                </div>

                {/* Footer CTA */}
                <div className="mt-4 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Still have a question?</p>
                        <p className="text-sm text-gray-500 mt-0.5">Our team is available 8am – 4pm AWST.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Contact us
                        </Link>
                        <Link
                            href="/help"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Help
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
