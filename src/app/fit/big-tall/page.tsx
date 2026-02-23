import { FitLandingPage } from "@/features/fit/FitLandingPage";

export const metadata = {
    title: "Tall Fit | Kingsize Big & Tall",
    description: "Shop the Tall fit range at Kingsize. Extra length where it matters — sleeves, inseams and torsos.",
};

export default function TallFitPage() {
    return (
        <FitLandingPage
            fit="tall"
            heading="Length where you need it most."
            subheading="Extra inseam, longer sleeves and extended torsos — because standard sizing was never designed for tall men."
            accentColor="#111"
        />
    );
}
