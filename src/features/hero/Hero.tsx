export const Hero = () => {
    return (
        <section
            className="relative overflow-hidden text-white flex items-center"
            style={{
                height: "280px",
                background: "linear-gradient(120deg, #0E1A2B 0%, #122238 60%, #142640 100%)",
            }}
        >
            {/* Subtle radial highlight behind text area */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 55% 70% at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 80%)",
                }}
            />

            {/* Oversized "1972" watermark — right side, desktop only */}
            <span
                aria-hidden="true"
                className="hidden md:block absolute right-12 select-none font-bold leading-none tracking-tighter"
                style={{
                    fontSize: "120px",
                    color: "rgba(255,255,255,0.05)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    userSelect: "none",
                    letterSpacing: "-0.02em",
                }}
            >
                Founded in 1972
            </span>

            {/* Left-aligned text block */}
            <div className="relative z-10 pl-10 md:pl-20 max-w-[680px]">

                {/* Accent Line + Headline row */}
                <div className="flex items-start gap-5 mb-4">
                    {/* Thin vertical gold accent line */}
                    <div
                        className="flex-shrink-0 mt-1"
                        style={{
                            width: "4px",
                            height: "52px",
                            background: "linear-gradient(to bottom, #C9A96E, #A8885A)",
                            borderRadius: "2px",
                        }}
                    />

                    <h1
                        className="font-bold text-white"
                        style={{
                            fontSize: "clamp(32px, 4vw, 46px)",
                            lineHeight: "1.12",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Built on 50 Years of Fit.<br />
                        Designed for What&apos;s Next.
                    </h1>
                </div>

                {/* Subtext */}
                <p
                    className="pl-9"
                    style={{
                        fontSize: "18px",
                        lineHeight: "1.55",
                        color: "rgba(255,255,255,0.68)",
                        maxWidth: "560px",
                    }}
                >
                    Built on family values, designed for real fit, and trusted to help every man feel confident in his own size.
                </p>

                {/* Micro CTA */}
                <a
                    href="#new-arrivals"
                    className="pl-9 mt-4 inline-block text-sm font-medium tracking-wide hover:opacity-100 transition-opacity"
                    style={{ color: "#C9A96E", opacity: 0.85 }}
                >
                    Explore the new experience →
                </a>
            </div>
        </section>
    );
};
