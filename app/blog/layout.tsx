import type { Metadata } from "next";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: { absolute: "Engineering Blog | LynxDEV" },
  description: "Technical deep-dives into building LynxDEV: architecture, performance, and engineering decisions for a zero-cost platform.",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
