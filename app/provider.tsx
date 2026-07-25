"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Toaster } from "sonner";
import { UserDetailContext } from "@/context/UserDetailContext";
import { VersionUpdateNotification } from "@/components/VersionUpdateNotification";

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState();

  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    const result = await axios.post("/api/user", {});
    console.log(result);
    setUserDetail(result?.data);
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
