import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Playfair_Display, Poppins } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

// Body copy and descriptions.
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600"] });
// Item names and prices, like the condensed sans on the boards.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
// Section titles.
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
// The logo lettering.
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: { default: "Campus Eats — order ahead", template: "%s · Campus Eats" },
  description:
    "Order breakfast, sandwiches, smashburgers and fat heroes from Campus Eats, then pick up and pay at the counter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${barlow.variable} ${barlowCondensed.variable} ${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
