import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AqarVision",
    template: "%s | AqarVision",
  },
  description:
    "Plateforme immobiliere intelligente pour l'Algerie - Recherche, gestion et analyse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
