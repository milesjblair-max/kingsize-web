import Link from "next/link";
import { RotateCcw, ArrowLeft, Store, Phone } from "lucide-react";

export const metadata = {
    title: "Returns Policy | Kingsize Big & Tall",
    description: "Our full returns and exchanges policy for in-store and online purchases.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
);

const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-1.5 list-disc pl-5 marker:text-gray-300">
        {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
);

export default function ReturnsPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white pt-12 pb-8 shadow-sm border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4">
                    <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium">
                        <ArrowLeft size={15} strokeWidth={2} /> Back to Help
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <RotateCcw size={20} strokeWidth={1.6} className="text-gray-700" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Returns Policy</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-10">
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 text-sm text-amber-900 mb-8">
                    <strong>Shop with confidence.</strong> If something is not right, we will help fix it. Underwear is non-returnable.
                </div>

                {/* Return Address Card */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 mb-10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Return Address</p>
                    <p className="font-bold text-gray-900 leading-relaxed text-lg">
                        Kingsize Big &amp; Tall<br />
                        PO Box 44<br />
                        Inglewood WA 6932
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-gray-600 font-medium">
                        <Phone size={15} strokeWidth={2} className="text-gray-400" />
                        <span>1800 810 702</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">8am – 4pm AWST</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <Section title="How long do I have to return an item?">
                        <p>You have 28 days to return or exchange your item.</p>
                        <BulletList items={["In-store: 28 days from purchase", "Online: 28 days from delivery"]} />
                        <p className="font-bold text-gray-800 mt-4">Items must:</p>
                        <BulletList items={["Have original tags attached", "Be unworn and only tried on for size"]} />
                    </Section>

                    <Section title="Can I return an online order in store?">
                        <p className="text-gray-900 font-bold">Yes.</p>
                        <p>Bring your tax invoice as proof of purchase. Refunds are processed back to your original payment method.</p>
                        <p className="italic text-gray-500">Items that do not meet return conditions may be declined.</p>
                    </Section>

                    <Section title="How do online returns work?">
                        <BulletList items={[
                            "Complete the return form on the back of your tax invoice",
                            "Post your item back to us",
                            "Return postage is the customer’s responsibility",
                            "We do not provide return labels"
                        ]} />
                        <p className="font-bold text-gray-800 mt-4">Refunds:</p>
                        <BulletList items={[
                            "Processed to your original payment method",
                            "Original shipping costs are not refunded",
                            "Please allow up to 10 business days for funds to appear"
                        ]} />
                        <p className="mt-4">For exchanges, additional postage charges may apply. Our team will contact you once your return is received.</p>
                    </Section>

                    <Section title="What if my item is incorrect or damaged?">
                        <p>If we made an error or your item arrives damaged, we will cover the return cost. Contact us immediately and we will resolve it quickly.</p>
                        <p className="mt-4 text-gray-500 text-xs">Please note: We cannot accept responsibility for incorrect size or style selections. Detailed sizing information is available on each product page.</p>
                    </Section>

                    <Section title="Are overseas returns different?">
                        <p className="text-gray-900 font-bold">Yes.</p>
                        <p>Customs duties and taxes paid on international orders are non-refundable.</p>
                    </Section>

                    <Section title="Where are your retail stores?">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-4">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 border-b pb-1">WA</h4>
                                <ul className="text-sm space-y-1"><li>Inglewood</li><li>Cannington</li><li>Joondalup</li></ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 border-b pb-1">QLD</h4>
                                <ul className="text-sm space-y-1"><li>Strathpine</li><li>Brisbane</li><li>Mount Gravatt</li><li>Chermside</li></ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 border-b pb-1">VIC</h4>
                                <ul className="text-sm space-y-1"><li>Dandenong</li></ul>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}
