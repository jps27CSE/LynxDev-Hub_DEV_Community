import {
  ContinueLearningSkeleton,
  EnrolledCoursesSkeleton,
  StatCardSkeleton,
  WelcomeBannerSkeleton,
} from "./_components/skeletons";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeBannerSkeleton />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <EnrolledCoursesSkeleton />
        </div>
        <div className="space-y-6">
          <ContinueLearningSkeleton />
        </div>
      </div>
    </div>
  );
}
