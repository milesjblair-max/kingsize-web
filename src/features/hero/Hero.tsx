export const Hero = () => {
    return (
        <section
            className="relative overflow-hidden text-white flex items-center py-8 lg:py-12"
            style={{
                minHeight: "clamp(240px, 28vw, 360px)",
                background: "linear-gradient(120deg, #0E1A2B 0%, #122238 60%, #142640 100%)",
                maxWidth: "100vw",
            }}
        >
            {/* Subtle radial highlight */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 55% 70% at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 80%)",
                }}
            />

            {/* "Founded in 1972" watermark */}
            <span
                aria-hidden="true"
                className="hidden md:block absolute right-12 select-none font-bold text-right"
                style={{
                    fontSize: "clamp(40px, 6vw, 100px)",
                    color: "rgba(255,255,255,0.04)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    pointerEvents: "none",
                }}
            >
                Founded in<br />1972
            </span>

            {/* Content Container */}
            <div
                className="relative z-10 w-full"
                style={{
                    paddingLeft: "clamp(20px, 8vw, 120px)",
                    paddingRight: "clamp(20px, 5vw, 60px)",
                }}
            >
                <div className="flex items-start gap-5 max-w-[800px]">
                    {/* Accent Line */}
                    <div
                        className="flex-shrink-0 mt-2"
                        style={{
                            width: "4px",
                            height: "clamp(40px, 5vw, 64px)",
                            background: "linear-gradient(to bottom, #C9A96E, #A8885A)",
                            borderRadius: "2px",
                        }}
                    />

                    <div className="flex flex-col">
                        <h1
                            className="font-bold text-white mb-4"
                            style={{
                                fontSize: "clamp(24px, 3.8vw, 48px)",
                                lineHeight: "1.1",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            50 years serving big and tall.<br />
                            Now we&rsquo;re making it effortless.
                        </h1>

                        {/* Subtext */}
                        <p
                            className="hidden sm:block mb-5"
                            style={{
                                fontSize: "clamp(14px, 1.4vw, 18px)",
                                lineHeight: "1.6",
                                color: "rgba(255,255,255,0.65)",
                                maxWidth: "540px",
                            }}
                        >
                            Smarter sizing, sharper recommendations, one account that remembers what works.
                        </p>

                        {/* Micro CTA */}
                        <a
                            href="/experience"
                            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide hover:translate-x-1 transition-all duration-300"
                            style={{
                                color: "#C9A96E",
                                fontSize: "clamp(12px, 1.2vw, 14px)",
                            }}
                        >
                            Explore the new experience coming soon &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
