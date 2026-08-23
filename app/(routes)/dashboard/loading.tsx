import {
  ContinueLearningSkeleton,
  EnrolledCoursesSkeleton,
  StatCardSkeleton,
  StatusStripSkeleton,
  WelcomeBannerSkeleton,
} from "./_components/skeletons";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-8">
      <WelcomeBannerSkeleton />
      <StatusStripSkeleton />
      <ContinueLearningSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        <div className="lg:col-span-2 space-y-5 sm:space-y-8">
          <EnrolledCoursesSkeleton />
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    </div>
  );
}
