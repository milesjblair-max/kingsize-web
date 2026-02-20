export const Hero = () => {
    return (
        <section
            className="relative overflow-hidden text-white flex items-center"
            style={{
                height: "clamp(180px, 25vw, 280px)",
                background: "linear-gradient(120deg, #0E1A2B 0%, #122238 60%, #142640 100%)",
                maxWidth: "100vw",
            }}
        >
            {/* Subtle radial highlight behind text area */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 55% 70% at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 80%)",
                }}
            />

            {/* "Founded in 1972" watermark — desktop only, non-overflowing */}
            <span
                aria-hidden="true"
                className="hidden md:block absolute right-8 select-none font-bold text-right"
                style={{
                    fontSize: "clamp(40px, 5.5vw, 90px)",
                    color: "rgba(255,255,255,0.05)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    userSelect: "none",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    pointerEvents: "none",
                    maxWidth: "32vw",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                }}
            >
                Founded in<br />1972
            </span>

            {/* Left-aligned text block */}
            <div
                className="relative z-10"
                style={{
                    paddingLeft: "clamp(16px, 5vw, 80px)",
                    paddingRight: "clamp(16px, 5vw, 40px)",
                    maxWidth: "min(680px, 60vw)",
                }}
            >
                {/* Accent Line + Headline row */}
                <div className="flex items-start gap-4 mb-3">
                    {/* Thin vertical gold accent line */}
                    <div
                        className="flex-shrink-0 mt-1"
                        style={{
                            width: "4px",
                            height: "clamp(32px, 4vw, 52px)",
                            background: "linear-gradient(to bottom, #C9A96E, #A8885A)",
                            borderRadius: "2px",
                        }}
                    />

                    <h1
                        className="font-bold text-white"
                        style={{
                            fontSize: "clamp(20px, 3.5vw, 46px)",
                            lineHeight: "1.12",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        50 years serving big and tall.<br />
                        Now we&rsquo;re making it effortless.
                    </h1>
                </div>

                {/* Subtext — hidden on very small screens */}
                <p
                    className="hidden sm:block"
                    style={{
                        paddingLeft: "clamp(16px, 2.5vw, 36px)",
                        fontSize: "clamp(13px, 1.5vw, 18px)",
                        lineHeight: "1.55",
                        color: "rgba(255,255,255,0.68)",
                        maxWidth: "560px",
                    }}
                >
                    Smarter sizing, sharper recommendations, one account that remembers what works.
                </p>

                {/* Micro CTA */}
                <a
                    href="/experience"
                    className="mt-3 inline-block text-sm font-medium tracking-wide hover:opacity-100 transition-opacity"
                    style={{
                        color: "#C9A96E",
                        opacity: 0.85,
                        paddingLeft: "clamp(16px, 2.5vw, 36px)",
                        fontSize: "clamp(11px, 1.2vw, 14px)",
                    }}
                >
                    Explore the new experience coming soon &rarr;
                </a>
            </div>
        </section>
    );
};
