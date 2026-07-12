import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AuthGate from "@/components/shared/AuthGate";
import ThemeProvider from "@/components/shared/ThemeProvider";
import QueryProvider from "@/components/shared/QueryProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian — Net Worth Tracker",
  description:
    "Track your net worth with monthly snapshots. See your financial trajectory over time.",
  icons: {
    icon: "/meridian-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased transition-colors duration-200">
        <QueryProvider>
          <AuthGate>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthGate>
        </QueryProvider>
      </body>
    </html>
  );
}
