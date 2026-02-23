import { FitLandingPage } from "@/features/fit/FitLandingPage";

export const metadata = {
    title: "Big and Tall Fit | Kingsize Big & Tall",
    description: "Shop the Big and Tall fit range at Kingsize. The full cut — broader and longer, built for you.",
};

export default function BigTallFitPage() {
    return (
        <FitLandingPage
            fit="big-tall"
            heading="Bigger. Taller. Built for both."
            subheading="The full cut — broader shoulders, longer inseams, and generous sizing throughout. Everything you need in one place."
            accentColor="#111"
        />
    );
}
