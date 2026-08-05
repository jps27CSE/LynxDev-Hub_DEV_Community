"use client";

import React, { useEffect, useRef, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { UserDetailContext } from "@/context/UserDetailContext";
import { VersionUpdateNotification } from "@/components/VersionUpdateNotification";

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState();
  const inFlightUser = useRef<Promise<void> | null>(null);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (userId) void CreateNewUser(userId);
  }, [user?.id]);

  const CreateNewUser = async (userId: string) => {
    if (syncedUserId.current === userId || inFlightUser.current) return;
    const request = (async () => {
      try {
        const result = await axios.post("/api/user", {});
        setUserDetail(result?.data);
        syncedUserId.current = userId;
      } catch (error) {
        console.error("[provider] CreateNewUser:", error);
        toast.error("Failed to load your profile. Please try again.");
      } finally {
        inFlightUser.current = null;
      }
    })();
    inFlightUser.current = request;
    await request;
  };

  return (
    <NextThemesProvider {...props}>
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        {children}
        <VersionUpdateNotification />
        <Toaster richColors closeButton />
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;
