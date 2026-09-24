import type { Metadata } from "next";
import Link from "next/link";
import {
  getUsersPaginated,
  clampAdminUsersPage,
  ADMIN_USERS_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  ADMIN_USERS_SORTS,
  parseAdminUsersSort,
  type AdminUsersSort,
} from "@/lib/admin-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "View and manage LynxDEV users — search, sort, and inspect enrollments and feedback.",
};

export const dynamic = "force-dynamic";

type UsersHrefParams = {
  q: string;
  sort: AdminUsersSort;
  subscription?: string;
  page: number;
};

function buildUsersHref(
  params: UsersHrefParams,
  overrides: Partial<UsersHrefParams>,
) {
  const q = overrides.q !== undefined ? overrides.q : params.q;
  const sort = overrides.sort !== undefined ? overrides.sort : params.sort;
  const subscription =
    overrides.subscription !== undefined ? overrides.subscription : params.subscription;
  const page = overrides.page !== undefined ? overrides.page : params.page;
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (sort !== "newest") sp.set("sort", sort);
  if (subscription) sp.set("subscription", subscription);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium border-border text-muted-foreground opacity-50 cursor-not-allowed select-none">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium border-border bg-card hover:bg-accent text-foreground transition-colors"
    >
      {children}
    </Link>
  );
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

  const currentParams: UsersHrefParams = { q, sort, subscription, page };

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

      {/* Sort controls — server links, client debounced search deferred to Task 6 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Sort:</span>
        {ADMIN_USERS_SORTS.map((s) => {
          const active = sort === s;
          return (
            <Link
              key={s}
              href={buildUsersHref(currentParams, { sort: s, page: 1 })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
              }`}
            >
              {s === "newest" ? "Newest" : s === "points" ? "Points" : "Name A-Z"}
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-center">Enrollments</TableHead>
                <TableHead className="text-center">Feedback</TableHead>
                <TableHead>Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    {q ? `No users matching "${q}".` : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {u.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate text-xs sm:text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {u.points ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {u.enrollmentsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {u.feedbackCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.subscription ? (
                        <Badge variant="secondary" className="text-xs">
                          {u.subscription}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total {total === 1 ? "user" : "users"}
          {total > ADMIN_USERS_PAGE_SIZE &&
          !hasMore &&
          data.length < total
            ? ` · showing ${data.length} on this page`
            : ""}
        </p>
        <div className="flex items-center gap-2">
          <PaginationLink
            href={buildUsersHref(currentParams, { page: page - 1 })}
            disabled={page <= 1}
          >
            Prev
          </PaginationLink>
          <span className="text-sm text-muted-foreground min-w-[70px] text-center">
            Page {page}
          </span>
          <PaginationLink
            href={buildUsersHref(currentParams, { page: page + 1 })}
            disabled={!hasMore}
          >
            Next
          </PaginationLink>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        Search requires 2+ characters server-side. Full interactive search, debounced input, and detail drawer land in Task 6-7.
      </p>
    </div>
  );
}
