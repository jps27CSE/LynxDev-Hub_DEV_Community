"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const navLinks = [
  { label: "courses", href: "/courses" },
  { label: "interview", href: "/interview" },
  { label: "problems", href: "/problems" },
];

function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#05060a]/60">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-fuchsia-400/50" />
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="LynxDev HUB"
            width={36}
            height={36}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-xl font-bold font-display tracking-tight">
            <span className="neon-text-gradient">LynxDev</span>{" "}
            <span className="text-slate-300">HUB</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative font-mono text-sm text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors">
                ~/
              </span>
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
            <span className="neon-pulse w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="font-mono text-[11px] text-slate-400">
              system: online
            </span>
          </div>
          {!user ? (
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg border border-cyan-400/30 bg-transparent font-mono text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/60 hover:text-white"
              >
                $ sign-in
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-mono shadow-[0_0_16px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all"
                >
                  ./dashboard
                </Button>
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
