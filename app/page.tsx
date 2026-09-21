import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Header from "@/app/_components/Header";
import Hero from "@/app/_components/Hero";
import Features from "@/app/_components/Features";
import YoutubeCarousel from "@/app/_components/YoutubeCarousel";
import YoutubeCarouselSkeleton from "@/app/_components/YoutubeCarouselSkeleton";
import CoursePreview from "@/app/_components/CoursePreview";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "LynxDEV",
  description:
    "Free developer community — learn web development, prep for interviews, solve DSA problems, and get AI mentorship.",
};

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Suspense fallback={<YoutubeCarouselSkeleton />}>
          <YoutubeCarousel />
        </Suspense>
        <CoursePreview />
      </main>
      <Footer />
    </div>
  );
}
