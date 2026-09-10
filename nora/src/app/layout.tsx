import type { Metadata } from "next";
import { Playfair_Display, Jost, El_Messiri, Cairo } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const elMessiri = El_Messiri({
  variable: "--font-elmessiri",
  subsets: ["arabic"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noola-gifts.example.om"),
  title: {
    default: "Noola — Luxury Gifts in Oman | Gifts, Thoughtfully Curated.",
    template: "%s | Noola Gifts Oman",
  },
  description:
    "Noola is Oman's premium gifting studio. Build a personalized gift box, basket or tote for birthdays, weddings, Eid, Ramadan and corporate gifting — with delivery across Oman.",
  keywords: [
    "Gifts in Oman",
    "Gift Boxes Oman",
    "Luxury Gifts Oman",
    "Corporate Gifts Oman",
    "Birthday Gifts Oman",
    "Eid Gifts Oman",
    "Ramadan Gifts Oman",
    "Personalized Gifts Oman",
    "Gift Delivery Oman",
  ],
  openGraph: {
    title: "Noola — Gifts, Thoughtfully Curated.",
    description:
      "Build a personalized gift for every occasion, delivered across Oman.",
    locale: "en_OM",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${playfair.variable} ${jost.variable} ${elMessiri.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <LocaleProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
