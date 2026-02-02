"use client";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const WelcomeBanner = () => {
  const { user } = useUser();
  return (
    <div className="flex gap-3 items-center">
      <Image src={"/coding.png"} width={120} height={120} alt="coding" />
      <h2 className="font-mono font-bold text-lg p-4 border bg-zinc-800 rounded-lg rounded-bl-none">
        Welcome Back, <span className="text-blue-300">{user?.fullName}</span>,
        Start Learning something new...
      </h2>
    </div>
  );
};

export default WelcomeBanner;
