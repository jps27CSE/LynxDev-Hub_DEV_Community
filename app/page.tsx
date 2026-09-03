import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/app/_components/Header";
import Hero from "@/app/_components/Hero";
import Features from "@/app/_components/Features";
import YoutubeCarousel from "@/app/_components/YoutubeCarousel";
import CoursePreview from "@/app/_components/CoursePreview";
import Footer from "@/app/_components/Footer";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

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
