import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  return (
    <div className="w-full relative h-screen overflow-hidden">
      <Image
        src={"/hero.jpg"}
        alt="hero"
        width={1000}
        height={1000}
        className="w-full h-full object-cover absolute inset-0"
      />

      <div className="absolute w-full flex flex-col items-center mt-20">
        <h2 className="font-bold text-7xl font-mono">Start Your </h2>
        <h2
          className="font-bold text-8xl font-mono text-yellow-400"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Coding Adventure
        </h2>

        <h2 className="mt-5 font-mono text-2xl">
          Beginner-friendly coding courses, projects, and a supportive developer
          community
        </h2>
        <Link href={"/sign-up"}>
          <Button
            className="font-mono text-3xl p-6 mt-7 font-bold cursor-pointer"
            variant={"pixel"}
          >
            GET STARTED
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Hero;
