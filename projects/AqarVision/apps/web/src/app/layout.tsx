import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "AqarVision",
    template: "%s | AqarVision",
  },
  description: "Plateforme immobilière algérienne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
