import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Provider from "@/app/provider";
import { ClerkProvider } from "@clerk/nextjs";

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
  title: "LynxDev HUB",
  description: "Developer Community",
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
          className={`${geistSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
        >
          <Provider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
