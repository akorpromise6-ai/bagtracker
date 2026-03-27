import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagTracker",
  description: "Real-time Solana portfolio analytics, wagers, and leaderboards powered by bags.fm.",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
