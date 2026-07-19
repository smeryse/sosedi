import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/lib/auth/session-context";
import { PageErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Соседи — совместная аренда без лишнего риска",
    template: "%s — Соседи",
  },
  description:
    "Найдите совместимых соседей, соберите группу и арендуйте подходящее жильё вместе.",
  icons: { icon: "/brand/sosedi-logo.svg" },
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["cyrillic", "latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-somic",
  display: "swap",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  display: "swap",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${instrumentSerif.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <SessionProvider>
            <PageErrorBoundary>
              {children}
            </PageErrorBoundary>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}