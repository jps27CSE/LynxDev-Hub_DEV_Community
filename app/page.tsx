"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/_components/Header";
import Hero from "@/app/_components/Hero";
import Features from "@/app/_components/Features";
import YoutubeCarousel from "@/app/_components/YoutubeCarousel";
import CoursePreview from "@/app/_components/CoursePreview";
import Footer from "@/app/_components/Footer";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <YoutubeCarousel />
        <CoursePreview />
      </main>
      <Footer />
    </div>
  );
}
