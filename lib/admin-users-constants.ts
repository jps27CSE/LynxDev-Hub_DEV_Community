export const ADMIN_USERS_PAGE_SIZE = 20;
export const MAX_SEARCH_LENGTH = 100;
export const ADMIN_USERS_MAX_PAGE = 500;

export type AdminUsersSort = "newest" | "points" | "name";

export const ADMIN_USERS_SORTS: readonly AdminUsersSort[] = ["newest", "points", "name"] as const;
