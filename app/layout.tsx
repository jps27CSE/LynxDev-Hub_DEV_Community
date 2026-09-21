import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Provider from "@/app/provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lynxdev.io"),
  title: {
    default: "LynxDEV",
    template: "%s | LynxDEV",
  },
  description:
    "Free developer community — courses, interview prep, DSA problems, and AI mentorship for web developers.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LynxDEV",
    title: "LynxDEV",
    description:
      "Free developer community — courses, interview prep, DSA problems, and AI mentorship for web developers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LynxDEV",
    description:
      "Free developer community — courses, interview prep, DSA problems, and AI mentorship for web developers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased overflow-x-hidden`}
        >
          <Provider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </Provider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
