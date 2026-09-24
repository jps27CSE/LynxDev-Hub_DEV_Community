import type { Metadata } from "next";
import Link from "next/link";
import {
  getUsersPaginated,
  clampAdminUsersPage,
  ADMIN_USERS_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  parseAdminUsersSort,
} from "@/lib/admin-users";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "View and manage LynxDEV users — search, sort, and inspect enrollments and feedback.",
};

export const dynamic = "force-dynamic";

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

  if (fetchError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">Manage LynxDEV users.</p>
        </div>
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Search by name or email, sort, and inspect user activity. Paginated {ADMIN_USERS_PAGE_SIZE} per page.
        </p>
      </div>

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
            Search: <span className="font-medium text-foreground">&quot;{q}&quot;</span>
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
    </div>
  );
}
