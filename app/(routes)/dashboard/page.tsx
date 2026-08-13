import { Suspense } from "react";
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { getEnrollmentsByEmail, getUserByEmail } from "@/lib/enroll-data";
import WelcomeBanner from "./_components/WelcomeBanner";
import StatusStrip from "./_components/StatusStrip";
import EnrolledCourses from "./_components/EnrolledCourses";
import ContinueLearning from "./_components/ContinueLearning";
import DailyTip from "./_components/DailyTip";
import ProblemStats from "./_components/ProblemStats";
import InterviewStats from "./_components/InterviewStats";
import QuickActions from "./_components/QuickActions";
import {
  ContinueLearningSkeleton,
  EnrolledCoursesSkeleton,
  StatCardSkeleton,
  StatusStripSkeleton,
  WelcomeBannerSkeleton,
} from "./_components/skeletons";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your courses, interview prep, and DSA progress in one place.",
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

async function HeroSection({
  email,
  avatarUrl,
}: {
  email: string;
  avatarUrl: string | null;
}) {
  const [user, enrollments] = await Promise.all([
    getUserByEmail(email),
    getEnrollmentsByEmail(email),
  ]);

  const completedCount = enrollments.filter((e) => e.completed_at).length;
  const status = {
    points: user?.points ?? 0,
    chaptersCompleted: enrollments.reduce(
      (sum, e) => sum + e.completedCount,
      0,
    ),
    coursesCompleted: completedCount,
    activeCourses: enrollments.length - completedCount,
  };

  return (
    <>
      <WelcomeBanner
        name={user?.name ?? null}
        avatarUrl={avatarUrl}
        skills={isStringArray(user?.skills) ? user.skills : null}
      />
      <StatusStrip status={status} />
    </>
  );
}

async function EnrolledCoursesSection({ email }: { email: string }) {
  const enrollments = await getEnrollmentsByEmail(email);
  return <EnrolledCourses enrollments={enrollments} />;
}

const Dashboard = async () => {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  const avatarUrl = clerkUser?.imageUrl ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {email && (
        <Suspense
          fallback={
            <div className="space-y-8">
              <WelcomeBannerSkeleton />
              <StatusStripSkeleton />
            </div>
          }
        >
          <HeroSection email={email} avatarUrl={avatarUrl} />
        </Suspense>
      )}

      {email && (
        <Suspense fallback={<ContinueLearningSkeleton />}>
          <ContinueLearning email={email} />
        </Suspense>
      )}

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {email && (
            <Suspense fallback={<EnrolledCoursesSkeleton />}>
              <EnrolledCoursesSection email={email} />
            </Suspense>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <DailyTip />
          <Suspense fallback={<StatCardSkeleton />}>
            <InterviewStats />
          </Suspense>
          <Suspense fallback={<StatCardSkeleton />}>
            <ProblemStats />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
