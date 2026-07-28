import { currentUser } from "@clerk/nextjs/server";
import { getEnrollmentsByEmail, type EnrolledCourse } from "@/lib/enroll-data";
import WelcomeBanner from "./_components/WelcomeBanner";
import EnrolledCourses from "./_components/EnrolledCourses";
import QuickLinks from "./_components/QuickLinks";
import DailyTip from "./_components/DailyTip";
import ProblemStats from "./_components/ProblemStats";
import InterviewStats from "./_components/InterviewStats";
import CoursePreview from "@/app/_components/CoursePreview";

const Dashboard = async () => {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  let enrolledCount = 0;
  let completedCount = 0;
  let enrollments: EnrolledCourse[] = [];

  if (email) {
    enrollments = await getEnrollmentsByEmail(email);
    enrolledCount = enrollments.length;
    completedCount = enrollments.filter((e) => e.completed_at).length;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeBanner enrolledCount={enrolledCount} completedCount={completedCount} />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InterviewStats />
        <ProblemStats />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <EnrolledCourses enrollments={enrollments} />
          <div className="border-t border-border/40 pt-8">
            <CoursePreview />
          </div>
        </div>
        <div className="space-y-6">
          <DailyTip />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
