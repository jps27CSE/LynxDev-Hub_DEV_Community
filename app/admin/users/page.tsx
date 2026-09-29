import type { Metadata } from "next";
import Link from "next/link";
import {
  getUsersPaginated,
  clampAdminUsersPage,
  ADMIN_USERS_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  parseAdminUsersSort,
} from "@/lib/admin-users";
import { getUserByClerkId } from "@/lib/enroll-data";
import { auth } from "@clerk/nextjs/server";
import UsersTable from "./_components/UsersTable";
import AdminPageWrapper from "../_components/AdminPageWrapper";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "View and manage LynxDEV users — search, sort, and inspect enrollments and feedback.",
};

export const dynamic = "force-dynamic";

async function getAdminName(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "Admin";
  const user = await getUserByClerkId(userId);
  return user?.name ?? "Admin";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; subscription?: string }>;
}) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q.trim().slice(0, MAX_SEARCH_LENGTH) : "";
  const q = rawQ;
  const sort = parseAdminUsersSort(params.sort);
  const rawPage = params.page;
  const parsedPage =
    rawPage !== undefined && /^\d+$/.test(rawPage) ? parseInt(rawPage, 10) : 1;
  const page = clampAdminUsersPage(parsedPage);
  const subscription =
    typeof params.subscription === "string" && params.subscription.trim()
      ? params.subscription.trim().slice(0, 50)
      : undefined;

  const adminName = await getAdminName();

  let data: Awaited<ReturnType<typeof getUsersPaginated>>["data"] = [];
  let total = 0;
  let hasMore = false;
  let fetchError = false;

  try {
    const result = await getUsersPaginated(q || undefined, sort, subscription, page);
    data = result.data;
    total = result.total;
    hasMore = result.hasMore;
  } catch {
    fetchError = true;
  }

  const content = fetchError ? (
    <div className="rounded-lg border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Failed to load users. TiDB may be waking. Please retry.
      </p>
      <Link
        href="/admin/users"
        className="inline-flex mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Retry
      </Link>
    </div>
  ) : (
    <>
      {/* Stat strip — light, no extra queries */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{total}</span>
        </span>
        <span className="text-muted-foreground">
          Page <span className="font-semibold text-foreground">{page}</span>
          {hasMore ? " · more" : ""}
        </span>
        {q && (
          <span className="text-muted-foreground">
            Search: <span className="font-medium text-foreground">"{q}"</span>
          </span>
        )}
      </div>

      <UsersTable
        data={data}
        total={total}
        hasMore={hasMore}
        currentQ={q}
        currentSort={sort}
        currentPage={page}
        currentSubscription={subscription}
      />
    </>
  );

  return (
    <AdminPageWrapper
      title="Users"
      description={`Search by name or email, sort, and inspect user activity. Paginated ${ADMIN_USERS_PAGE_SIZE} per page.`}
    >
      {content}
    </AdminPageWrapper>
  );
}