import LandingPage from "@/components/landing/LandingPage";
import { getMasterSettings } from "@/lib/admin/data";
import { Poppins } from "next/font/google";
import "@/components/landing/landing.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Chirpii – Short Stories. Big Emotions. | Premium OTT Streaming",
  description:
    "Stream explosive 2-minute regional mini-series, romantic dramas, and thrillers. Download the official Chirpii app from Google Play Store.",
  keywords: [
    "Chirpii",
    "Mini OTT",
    "Telugu web series",
    "Micro drama",
    "Short series",
    "ChaiShots",
    "ReelShort",
    "Pocket FM",
    "Bite sized episodes",
  ],
  openGraph: {
    title: "Chirpii – Short Stories. Big Emotions.",
    description:
      "India's premier Mini OTT platform for 2-minute micro dramas and regional short series.",
    images: ["/landing-logo.png"],
  },
};

export default async function HomePage() {
  const settings = await getMasterSettings().catch(() => ({}));
  const playStoreUrl =
    process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
    settings?.playStoreUrl ||
    "https://play.google.com/store/apps/details?id=com.chirpii.app";

  return (
    <div className={poppins.variable}>
      <LandingPage playStoreUrl={playStoreUrl} />
    </div>
  );
}
