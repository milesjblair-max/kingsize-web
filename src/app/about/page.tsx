import Image from "next/image";

export default function About() {
    return (
        <div className="min-h-screen bg-white text-gray-900 pb-16 overflow-x-hidden">
            {/* Main Framing Container */}
            <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16">

                {/* Image 1: Left (Kingsize 1972) */}
                <div className="w-full sm:w-[320px] lg:w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col items-center lg:items-start pt-1.5">
                    <div className="relative h-[340px] w-full overflow-hidden rounded-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white border border-gray-100 flex items-center justify-center">
                        <Image
                            src="/images/heritage/Kingsize 1972.jpg"
                            alt="Kingsize Store 1972"
                            fill
                            className="object-contain grayscale brightness-[1.05] contrast-[1.1] p-2"
                            sizes="(max-width: 1024px) 320px, 320px"
                            priority
                        />
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
                    </div>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-center lg:text-left leading-tight">Est. 1972 · Original Location</p>
                </div>

                {/* Main Text Content */}
                <div className="flex-1 max-w-[650px] order-2 lg:order-none">
                    {/* Page Title - Aligned with image tops */}
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-8 text-black leading-[1.0]">
                        About Kingsize
                    </h1>

                    {/* Intro Section Content */}
                    <div className="space-y-7">
                        <p className="text-lg leading-relaxed text-gray-800">
                            Kingsize Big &amp; Tall is an Australian family-owned menswear business built on one simple belief: every man deserves clothing that fits properly, feels comfortable, and reflects his personal style.
                        </p>
                        <p className="text-lg leading-relaxed text-gray-800">
                            Founded in 1972 with the opening of our first store in Inglewood, Western Australia, Kingsize was created to serve a market that had long been overlooked.
                        </p>
                        <p className="text-lg leading-relaxed text-gray-800">
                            From the beginning, the focus was not just on offering larger sizes. It was about understanding proportion, comfort, confidence, and the real needs of big and tall men. That philosophy continues to shape everything we do today.
                        </p>
                        <p className="text-lg leading-relaxed text-gray-800">
                            Over more than five decades, Kingsize has grown into one of Australia&apos;s most trusted destinations for big and tall menswear, with stores across multiple states and a long-standing online presence that began in the early days of ecommerce.
                        </p>
                        <p className="text-lg leading-relaxed text-gray-800">
                            Generations of customers rely on Kingsize not only for clothing, but for honest advice, dependable quality, and a shopping experience built on respect.
                        </p>
                    </div>
                </div>

                {/* Image 2: Right (Kingsize original) */}
                <div className="w-full sm:w-[320px] lg:w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col items-center lg:items-end pt-1.5 order-3 lg:order-none">
                    <div className="relative h-[340px] w-full overflow-hidden rounded-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white border border-gray-100 flex items-center justify-center">
                        <Image
                            src="/images/heritage/Kingsize original.jpg"
                            alt="Kingsize Original Heritage"
                            fill
                            className="object-contain grayscale brightness-[1.05] contrast-[1.1] p-2"
                            sizes="(max-width: 1024px) 320px, 320px"
                            priority
                        />
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
                    </div>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-center lg:text-right leading-tight">A Family Legacy · Built on Trust</p>
                </div>
            </div>

            {/* Bottom Content Container */}
            <div className="max-w-[800px] mx-auto px-6">

                {/* What Kingsize stands for */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
                    What Kingsize stands for
                </h2>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Kingsize exists to remove frustration from shopping and replace it with confidence.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Big and tall clothing is not standard sizing with extra fabric. It demands thoughtful design, carefully selected brands, and a deep understanding of how garments should fit, move, and last over time.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    We focus on three things: <span className="font-bold">Fit integrity. Practical quality. Modern style.</span>
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Every product is chosen to balance comfort, durability, and contemporary design — allowing customers to build a complete wardrobe without compromise.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    We work with leading Australian and international labels while continually sourcing styles that reflect how men live, work, and present themselves today.
                </p>

                {/* What we are building now */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
                    What we are building now
                </h2>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Kingsize is entering a new chapter.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    While our values remain unchanged, the way we serve our customers is evolving. We are modernising the business to make shopping simpler, more personalised, and more convenient across every touchpoint.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    We are investing in better systems, clearer information, and smarter ways to connect customers with the right products faster. The goal is not change for the sake of change. It is progress that strengthens what has always mattered: fit, trust, and long-term relationships.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    As retail continues to shift into a more digital and customer-focused era, Kingsize is adapting with intention. We are combining decades of specialised expertise with modern tools that improve accuracy, reduce friction, and create a more seamless experience.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    The vision is the same.<br />The execution is becoming sharper.
                </p>

                {/* A family business built on trust */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
                    A family business built on trust
                </h2>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    As a family-run company, relationships have always mattered more than transactions.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Many of our customers have shopped with Kingsize for decades, and many of our team members have spent years developing strong product knowledge and lasting connections within the community we serve.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    This heritage shapes how we operate:
                </p>

                <ul className="list-disc pl-5 space-y-2 mb-4 marker:text-gray-400 text-lg leading-7 text-gray-800">
                    <li className="pl-1">Practical advice instead of sales pressure</li>
                    <li className="pl-1">Reliable service built on long-term trust</li>
                    <li className="pl-1">Flexible returns that remove risk from online shopping</li>
                    <li className="pl-1">Knowledgeable staff who understand fit complexities</li>
                </ul>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Customers are never expected to settle for poor sizing. The goal is always to help each person find clothing that feels right, looks right, and supports confidence in everyday life.
                </p>

                {/* A nationwide presence */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
                    A nationwide presence with global reach
                </h2>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Kingsize combines physical retail expertise with a strong online experience, allowing customers across Australia and internationally to access specialised sizing without geographic limitations.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Our stores provide hands-on fitting support, while our online platform delivers convenience, detailed sizing guidance, and dependable delivery options.
                </p>
                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Customers throughout Australia, New Zealand, and beyond continue to rely on Kingsize because they know what to expect: consistent quality, predictable sizing, and service that stands behind every purchase.
                </p>

                {/* Our Mission */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
                    Our mission
                </h2>

                <p className="text-lg leading-7 mb-4 text-gray-800">
                    Kingsize aims to be the most trusted destination for big and tall menswear in Australia by delivering clothing that genuinely fits, modern styles without compromise, dependable service grounded in expertise, and a shopping experience that builds confidence.
                </p>
                <p className="text-lg leading-7 mb-4 font-medium text-black">
                    We believe clothing should support how a man lives, works, and presents himself, not limit it.
                </p>
            </div>
        </div>
    );
}
