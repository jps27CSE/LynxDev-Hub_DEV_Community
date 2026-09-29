"use client";

import { ReactNode } from "react";

type AdminPageWrapperProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function AdminPageWrapper({
  children,
  title,
  description,
}: AdminPageWrapperProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {children}
    </div>
  );
}