/**
 * @file UsersTable.tsx
 * @description The main component of the application.
 *
 * All state lives here — search query, current page, which row is being
 * edited, and which rows are selected. Child components (UserRow, EditRow)
 * receive what they need as props and call handler functions to report
 * actions back up to this component.
 *
 * This pattern is called "lifting state up" — a standard React approach
 * where the parent owns the data and children just display it.
 *
 * Search icon is loaded from /public/search.svg as a static file.
 * Pagination is centre-aligned in the footer using justify-content: center.
 */

import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { User } from "../types/user.types";
import { UserRow } from "./UserRow";

/**
 * Number of rows displayed per page.
 * Defined as a constant at the top so it is easy to change later
 * without hunting through the component code.
 */
const PAGE_SIZE = 10;

/**
 * UsersTable — renders the search bar, the data table, and the footer
 * (Delete Selected button + pagination).
 *
 * State variables and what they store:
 *
 *   query       string        — text currently typed in the search box
 *   page        number        — which page number the user is on (starts at 1)
 *   editingId   string|null   — id of the row in edit mode, null when no row is open
 *   selectedIds string[]      — array of user ids whose checkboxes are ticked
 */
export function UsersTable() {
  const { users, loading, error, updateUser, deleteUser, deleteMultiple } =
    useUsers();

  /**
   * query is typed as string explicitly with useState<string>.
   * This makes the intent clear — the state is always a string,
   * never null or undefined. TypeScript would infer it from ''
   * but writing the type is considered better practice.
   */
  const [query, setQuery] = useState<string>("");

  /** Current page. Typed as number for the same reason as query above. */
  const [page, setPage] = useState<number>(1);

  /**
   * editingId tracks which row is open for editing.
   * string | null means it is either a user id (string) or nothing (null).
   * When the user clicks Edit on a row, we set this to that row's id.
   * When they save or cancel, we set it back to null.
   * Only one row can be edited at a time because there is only one value here.
   */
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * selectedIds stores the ids of all checked rows as a plain string array.
   * We use .includes() to check membership and spread [...arr, newId] to add.
   */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ─── Step 1: Filter users by search query ────────────────────────────────

  /**
   * filteredUsers is derived directly from users and query.
   * Every time either changes, React re-renders and this runs again.
   * No extra state needed — it is computed fresh each render.
   *
   * Optional chaining (u?.name?.toLowerCase()) means:
   *   read name, but if name is undefined return undefined instead of crashing.
   * The ?? '' fallback means: if undefined, use empty string for the comparison.
   */
  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      (u?.name?.toLowerCase() ?? "").includes(q) ||
      (u?.email?.toLowerCase() ?? "").includes(q) ||
      (u?.role?.toLowerCase() ?? "").includes(q)
    );
  });

  // ─── Step 2: Pagination ───────────────────────────────────────────────────

  /**
   * totalPages: how many pages the filtered list needs.
   * Math.ceil rounds up — 25 users / 10 per page = 2.5, rounds to 3.
   * Math.max(1, ...) ensures we never show 0 pages even if the list is empty.
   */
  const totalPages: number = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  /**
   * currentPage: safe version of page.
   * If the user was on page 4 and a search reduces results to 1 page,
   * we clamp to page 1 so the table does not show as empty.
   */
  const currentPage: number = page > totalPages ? 1 : page;

  /** start: index of the first item on this page in the filteredUsers array */
  const start: number = (currentPage - 1) * PAGE_SIZE;

  /** pageUsers: the 10 (or fewer) users to actually render in the table */
  const pageUsers: User[] = filteredUsers.slice(start, start + PAGE_SIZE);

  /** pageIds: just the ids of the visible rows, used for select-all logic */
  const pageIds: string[] = pageUsers.map((u) => u.id);

  // ─── Step 3: Selection helpers ───────────────────────────────────────────

  /**
   * allPageSelected is true when every row on the current page is checked.
   * Used to decide whether the header checkbox should appear checked.
   */
  const allPageSelected: boolean =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  /**
   * somePageSelected is true when at least one (but not all) rows are checked.
   * Used to put the header checkbox into the indeterminate (half-filled) state.
   */
  const somePageSelected: boolean =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  /**
   * toggleRow — checks or unchecks a single row.
   * If the id is already in selectedIds, remove it. Otherwise add it.
   *
   * @param id — the user id to toggle
   */
  function toggleRow(id: string): void {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((s) => s !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  /**
   * togglePageSelection — checks or unchecks all rows on the current page only.
   * Rows on other pages are not affected.
   *
   * If everything on this page is already checked → uncheck all of them.
   * Otherwise → check any that are not yet checked.
   */
  function togglePageSelection(): void {
    if (allPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const newIds = pageIds.filter((id) => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...newIds]);
    }
  }

  // ─── Step 4: Action handlers ─────────────────────────────────────────────

  /**
   * handleSearch — called every time the user types in the search box.
   * Resets to page 1 so the results start from the beginning.
   * Clears selection because selected rows from the old results are now stale.
   *
   * @param value — the current text in the search input (typed as string)
   */
  function handleSearch(value: string): void {
    setQuery(value);
    setPage(1);
    setSelectedIds([]);
  }

  /**
   * handleSave — called by EditRow after the user clicks Save and validation passes.
   * Updates the user in the master list and closes edit mode.
   *
   * @param updated — the updated User object returned from EditRow
   */
  function handleSave(updated: User): void {
    updateUser(updated);
    setEditingId(null);
  }

  /**
   * handleDelete — removes one user and tidies up related state.
   * Removes from selection in case it was checked.
   * Closes edit mode in case it was open for that row.
   *
   * @param id — the id of the user to delete
   */
  function handleDelete(id: string): void {
    deleteUser(id);
    setSelectedIds(selectedIds.filter((s) => s !== id));
    if (editingId === id) setEditingId(null);
  }

  /**
   * handleDeleteSelected — removes all checked rows at once.
   * Called by the Delete Selected button in the footer.
   */
  function handleDeleteSelected(): void {
    deleteMultiple(selectedIds);
    setSelectedIds([]);
    setEditingId(null);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Loading users…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <div className="card">
        {/* ── Search bar ─────────────────────────────────────────────────── */}
        {/*
          The search icon is an <img> pointing to /public/search.svg.
          Vite serves /public files at the root URL, so the path is /search.svg.
          The grey tint is applied by the CSS filter on .search-icon-wrap img.
        */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon-wrap">
              <img
                src="/search.svg"
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
              />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or role"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <table>
          {/*
            colgroup sets fixed column widths.
            Without this, columns resize as rows enter edit mode (inputs are wider).
            Fixed widths keep the layout stable.
          */}
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: 120 }} />
          </colgroup>

          <thead>
            <tr>
              <th>
                {/*
                  Header checkbox — selects/deselects all rows on the current page.
                  React does not have an `indeterminate` prop for checkboxes,
                  so we use a ref callback to set it directly on the DOM element.
                  Optional chaining (if (el)) guards against el being null on unmount.
                */}
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={togglePageSelection}
                  aria-label="Select all on this page"
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No users found.</div>
                </td>
              </tr>
            ) : (
              pageUsers.map((user) => (
                /*
                  key={user.id} tells React which DOM element maps to which user.
                  Without key, React cannot efficiently update the list when rows
                  are deleted or reordered — it would re-render everything.
                */
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  isEditing={editingId === user.id}
                  onSelect={() => toggleRow(user.id)}
                  onEdit={() => setEditingId(user.id)}
                  onDelete={() => handleDelete(user.id)}
                  onSave={handleSave}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))
            )}
          </tbody>
        </table>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {/*
          The footer uses justify-content: center so the entire row
          (Delete Selected button + pagination) is centred on the page,
          matching the reference design.
          The Delete Selected button is on the left inside that centred group.
        */}
        <div className="footer">
          {/* Delete Selected — disabled when nothing is checked */}
          <button
            className="btn-del-selected"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete Selected
          </button>

          {/* ── Pagination ─────────────────────────────────────────────── */}
          <div className="pagination">
            {/* First page button */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              {/* Double left chevron — inline SVG, no file needed for navigation arrows */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>

            {/* Previous page button */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/*
              Page number buttons.
              Array.from({ length: totalPages }, (_, i) => i + 1)
              creates [1, 2, 3, ... totalPages] — an array we can .map() over.
              The active class is added when p === currentPage.
            */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pg-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ))}

            {/* Next page button */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Last page button */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
