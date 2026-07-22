import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/lib/auth/session-context";
import { PageErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { PwaManager } from "@/components/pwa/pwa-manager";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Соседи | CI/CD работает",
    template: "%s — Соседи",
  },
  description:
    "Найдите совместимых соседей, соберите группу и арендуйте подходящее жильё вместе.",
  applicationName: "Соседи",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Соседи",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/brand/sosedi-symbol-v2.svg", type: "image/svg+xml" },
      { url: "/pwa-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/pwa-icon/180",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F3EA" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
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
            <PwaManager />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
