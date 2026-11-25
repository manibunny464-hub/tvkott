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
  title: "TVK OTT – Short Stories. Big Emotions. | Premium OTT Streaming",
  description:
    "Stream explosive 2-minute regional mini-series, romantic dramas, and thrillers. Download the official TVK OTT app from Google Play Store.",
  keywords: [
    "TVK OTT",
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
    title: "TVK OTT – Short Stories. Big Emotions.",
    description:
      "India's premier Mini OTT platform for 2-minute micro dramas and regional short series.",
    images: ["/tvk-admin-logo.webp"],
  },
};

export default async function HomePage() {
  const settings = await getMasterSettings().catch(() => ({}));
  const playStoreUrl =
    process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
    settings?.playStoreUrl ||
    (process.env.NEXT_PUBLIC_PLAY_STORE_URL || '');

  return (
    <div className={poppins.variable}>
      <LandingPage playStoreUrl={playStoreUrl} />
    </div>
  );
}
