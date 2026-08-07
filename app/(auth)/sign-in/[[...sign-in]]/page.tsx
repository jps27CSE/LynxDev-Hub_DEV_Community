"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { BookOpen, Bot, Target, Users, type LucideIcon } from "lucide-react";
import {
  AuthPageBackground,
  AuthShell,
  authConnectionClass,
} from "../../_components/auth";

const platformPoints: {
  icon: LucideIcon;
  text: string;
  accent: string;
}[] = [
  {
    icon: BookOpen,
    text: "12+ interactive courses — learn by doing",
    accent: "text-cyan-400",
  },
  {
    icon: Bot,
    text: "AI mentor that streams answers 24/7",
    accent: "text-fuchsia-400",
  },
  {
    icon: Target,
    text: "900+ interview questions, tag-based prep",
    accent: "text-lime-400",
  },
  {
    icon: Users,
    text: "a community of developers that grows with you",
    accent: "text-violet-400",
  },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      <AuthPageBackground />

      <div className="hidden lg:flex relative flex-col justify-center px-12 xl:px-20 py-16 border-r border-white/5">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5 font-mono text-xs text-cyan-200/90 mb-9">
            <span className="neon-pulse w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-400">$</span> lynxdev --welcome
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.05] text-5xl xl:text-6xl text-balance [filter:drop-shadow(0_0_28px_rgba(34,211,238,0.18))]">
            <span className="neon-text-gradient">Learn. Build.</span>
            <br />
            <span className="neon-text-gradient">Grow.</span>{" "}
            <span className="relative inline-block">
              For free.
              <span className="absolute -inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent sm:-bottom-2" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-md leading-relaxed">
            Interactive courses, an AI mentor, interview prep, and a developer
            community — handcrafted, zero-cost, and built for engineers who want
            to ship.
          </p>

          <ul className="mt-10 space-y-4">
            {platformPoints.map((point) => {
              const Icon = point.icon;
              return (
                <li
                  key={point.text}
                  className="flex items-center gap-3 font-mono text-sm text-slate-300"
                >
                  <Icon className={`w-4 h-4 shrink-0 ${point.accent}`} />
                  {point.text}
                </li>
              );
            })}
          </ul>

          <div className="mt-12 pt-6 border-t border-white/5 flex items-center gap-3">
            <span className="neon-pulse w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="font-mono text-[11px] text-slate-500">
              system: online — open source, always
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <SignIn.Root>
            <SignIn.Step name="start" className="w-full">
              <AuthShell title="lynxdev — auth">
                <div className="text-center mb-7">
                  <p className="font-mono text-[11px] text-cyan-400/80 mb-2.5">
                    <span className="text-cyan-400">$</span> lynxdev --login
                  </p>
                  <h1 className="text-2xl font-bold font-display tracking-tight">
                    Welcome <span className="neon-text-gradient">back</span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-1.5">
                    One tap and you&apos;re in — no forms, no friction
                  </p>
                </div>

                <Clerk.GlobalError className="block text-center font-mono text-sm text-red-400" />

                <div className="space-y-3">
                  <Clerk.Connection
                    name="google"
                    className={authConnectionClass}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Clerk.Connection>

                  <Clerk.Connection
                    name="github"
                    className={authConnectionClass}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Clerk.Connection>
                </div>

                <div className="pt-4 text-center font-mono text-[11px] text-slate-600">
                  <span className="text-cyan-400/70">//</span> no passwords, no
                  email forms — just one tap
                </div>

                <p className="text-center font-mono text-xs text-slate-500 pt-4">
                  <span className="text-cyan-400/70">//</span> first time? your
                  first tap signs you up
                </p>
              </AuthShell>
            </SignIn.Step>
          </SignIn.Root>
        </div>
      </div>
    </div>
  );
}
