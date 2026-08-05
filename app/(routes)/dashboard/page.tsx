import { Suspense } from "react";
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { getEnrollmentsByEmail, getUserByEmail } from "@/lib/enroll-data";
import WelcomeBanner from "./_components/WelcomeBanner";
import EnrolledCourses from "./_components/EnrolledCourses";
import ContinueLearning from "./_components/ContinueLearning";
import DailyTip from "./_components/DailyTip";
import ProblemStats from "./_components/ProblemStats";
import InterviewStats from "./_components/InterviewStats";
import {
  ContinueLearningSkeleton,
  EnrolledCoursesSkeleton,
  StatCardSkeleton,
  WelcomeBannerSkeleton,
} from "./_components/skeletons";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your courses, interview prep, and DSA progress in one place.",
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

async function WelcomeSection({ email }: { email: string }) {
  const [user, enrollments] = await Promise.all([
    getUserByEmail(email),
    getEnrollmentsByEmail(email),
  ]);

  return (
    <WelcomeBanner
      name={user?.name ?? null}
      points={user?.points ?? 0}
      skills={isStringArray(user?.skills) ? user.skills : null}
      enrolledCount={enrollments.length}
      completedCount={enrollments.filter((e) => e.completed_at).length}
    />
  );
}

async function EnrolledCoursesSection({ email }: { email: string }) {
  const enrollments = await getEnrollmentsByEmail(email);
  return <EnrolledCourses enrollments={enrollments} />;
}

const Dashboard = async () => {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {email && (
        <Suspense fallback={<WelcomeBannerSkeleton />}>
          <WelcomeSection email={email} />
        </Suspense>
      )}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Suspense fallback={<StatCardSkeleton />}>
          <InterviewStats />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <ProblemStats />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {email && (
            <Suspense fallback={<EnrolledCoursesSkeleton />}>
              <EnrolledCoursesSection email={email} />
            </Suspense>
          )}
        </div>
        <div className="space-y-6">
          {email ? (
            <Suspense fallback={<ContinueLearningSkeleton />}>
              <ContinueLearning email={email} />
            </Suspense>
          ) : null}
          <DailyTip />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
