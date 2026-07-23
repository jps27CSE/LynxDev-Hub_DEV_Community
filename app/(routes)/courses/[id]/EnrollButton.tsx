"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle } from "lucide-react";

export default function EnrollButton({ courseId }: { courseId: number }) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/enroll", { courseId });
      setEnrolled(true);
    } catch {
      // already enrolled or error
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <Button size="lg" disabled className="gap-2">
        <CheckCircle className="w-5 h-5" />
        Enrolled
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={loading}>
      {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
      Enroll Now
    </Button>
  );
}
