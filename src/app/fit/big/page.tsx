import { FitLandingPage } from "@/features/fit/FitLandingPage";

export const metadata = {
    title: "Big Fit | Kingsize Big & Tall",
    description: "Shop the Big fit range at Kingsize. Generous cuts designed specifically for broader builds.",
};

export default function BigFitPage() {
    return (
        <FitLandingPage
            fit="big"
            heading="Built for a bigger build."
            subheading="Generous cuts, extended sizing and the right proportions — every piece made to fit your shape, not fight it."
            accentColor="#111"
        />
    );
}
