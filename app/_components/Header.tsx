"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Interview", href: "/interview" },
  { label: "Community", href: "/community" },
  { label: "Mentor", href: "/mentor" },
];

function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="LynxDev HUB" width={36} height={36} />
          <span className="text-xl font-bold font-inter">LynxDev HUB</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/sign-in">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  Dashboard
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
